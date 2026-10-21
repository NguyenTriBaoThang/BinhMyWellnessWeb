import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { extractTripConstraints, type TripDraft } from '@/lib/ai/constraints';
import { consumeAiRateLimit } from '@/lib/ai/rate-limit';
import { getVerifiedCandidates } from '@/lib/itinerary/catalog';
import { buildItinerary, type BudgetBasis, type ItineraryRequest, type TransportMode } from '@/lib/itinerary/engine';
import { getGoongRoute } from '@/lib/routing/goong';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { getTodayInVietnam } from '@/lib/utils';

export const maxDuration = 15;

type Origin = { latitude: number; longitude: number; label?: string };

function validTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validCoordinates(value: unknown): value is Origin {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.latitude === 'number' && Number.isFinite(item.latitude)
    && item.latitude >= -90 && item.latitude <= 90
    && typeof item.longitude === 'number' && Number.isFinite(item.longitude)
    && item.longitude >= -180 && item.longitude <= 180
    && (item.label === undefined || (typeof item.label === 'string' && item.label.length <= 100));
}

function validateDraft(value: unknown): TripDraft {
  if (!value || typeof value !== 'object') return {};
  const item = value as Record<string, unknown>;
  const draft: TripDraft = {};
  if (typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) draft.date = item.date;
  if (validTime(item.startTime)) draft.startTime = item.startTime;
  if (validTime(item.endTime)) draft.endTime = item.endTime;
  if (Number.isInteger(item.adults) && Number(item.adults) >= 0 && Number(item.adults) <= 50) draft.adults = Number(item.adults);
  if (Number.isInteger(item.children) && Number(item.children) >= 0 && Number(item.children) <= 50) draft.children = Number(item.children);
  if (Number.isSafeInteger(item.budgetVnd) && Number(item.budgetVnd) >= 0 && Number(item.budgetVnd) <= 1_000_000_000) draft.budgetVnd = Number(item.budgetVnd);
  if (item.budgetBasis === 'GROUP' || item.budgetBasis === 'PER_PERSON') draft.budgetBasis = item.budgetBasis;
  if (item.transportMode === 'car' || item.transportMode === 'bike' || item.transportMode === 'walk') draft.transportMode = item.transportMode;
  if (Array.isArray(item.interests)) {
    draft.interests = item.interests.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim().slice(0, 100)).slice(0, 8);
  }
  if (typeof item.returnToOrigin === 'boolean') draft.returnToOrigin = item.returnToOrigin;
  return draft;
}

function mergeDraft(current: TripDraft, update: TripDraft): TripDraft {
  const merged = { ...current };
  for (const [key, value] of Object.entries(update)) {
    if (value !== undefined) Object.assign(merged, { [key]: value });
  }
  return merged;
}

function monthContext(): string {
  return getTodayInVietnam().slice(0, 7);
}

async function recordUsage(data: {
  userId?: string;
  requestId: string;
  mode: string;
  outcome: string;
  inputTokens?: number;
  outputTokens?: number;
}) {
  try {
    await prisma.aiUsageLog.create({
      data: {
        userId: data.userId,
        requestId: data.requestId,
        mode: data.mode,
        outcome: data.outcome,
        model: data.mode === 'GEMINI' ? process.env.GEMINI_MODEL || 'configured-model' : 'not-used',
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
      },
    });
  } catch {
    // Usage logging must never expose model errors or block a valid itinerary response.
  }
}

function questionFor(missing: string[]): string {
  const questions: Record<string, string> = {
    date: 'Bạn muốn đi ngày nào? Mình đang mặc định xem dữ liệu trong tháng hiện tại.',
    adults: 'Có bao nhiêu người lớn tham gia?',
    budgetBasis: 'Ngân sách bạn nêu tính cho cả nhóm hay mỗi người?',
    origin: 'Bạn muốn tính đường từ vị trí nào? Chỉ gửi tọa độ cho dịch vụ chỉ đường khi bạn đồng ý.',
  };
  return missing.map((item) => questions[item]).filter(Boolean).join(' ');
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  try {
    if (!isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Lập lịch cần kết nối PostgreSQL để đọc dữ liệu đã xác minh.' }, { status: 503 });
    }
    const user = await getCurrentUser();
    if (user && user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Tính năng lập lịch dành cho khách hàng.' }, { status: 403 });
    }
    if (!await consumeAiRateLimit(request, user?.id)) {
      return NextResponse.json({ error: 'Bạn đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau một phút.' }, { status: 429 });
    }

    const body = await request.json() as Record<string, unknown>;
    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2_000) {
      return NextResponse.json({ error: 'Tin nhắn cần có nội dung và không quá 2.000 ký tự.' }, { status: 400 });
    }
    const current = validateDraft(body.trip);
    const extracted = await extractTripConstraints(body.message.trim(), current);
    const trip = mergeDraft(current, extracted.constraints);
    const allowExternalRouting = body.allowExternalRouting === true;
    const origin = allowExternalRouting && validCoordinates(body.origin) ? body.origin : undefined;

    const missing: string[] = [];
    if (!trip.date) missing.push('date');
    if (trip.adults === undefined) missing.push('adults');
    if (trip.budgetVnd !== undefined && !trip.budgetBasis) missing.push('budgetBasis');
    if (trip.returnToOrigin && !origin) missing.push('origin');
    if (missing.length) {
      await recordUsage({ userId: user?.id, requestId, mode: extracted.mode, outcome: 'NEEDS_INFORMATION', inputTokens: extracted.inputTokens, outputTokens: extracted.outputTokens });
      return NextResponse.json({
        requestId,
        status: 'NEEDS_INFORMATION',
        assistantMessage: questionFor(missing),
        missing,
        trip,
        monthContext: monthContext(),
        mode: extracted.mode === 'GEMINI' ? 'GEMINI' : 'RULE_BASED_FALLBACK',
      });
    }

    const adults = trip.adults!;
    const children = trip.children ?? 0;
    if (adults + children < 1 || adults + children > 50) {
      return NextResponse.json({ error: 'Số người cần từ 1 đến 50.' }, { status: 400 });
    }
    const assumed: string[] = [];
    if (trip.children === undefined) assumed.push('Tạm tính không có trẻ em.');
    if (trip.startTime === undefined) assumed.push('Giờ bắt đầu tạm tính 08:00.');
    if (trip.endTime === undefined) assumed.push('Giờ kết thúc tạm tính 17:00.');
    if (trip.budgetVnd === undefined) assumed.push('Chưa giới hạn ngân sách.');
    if (trip.transportMode === undefined) assumed.push('Phương tiện tạm tính là ô tô.');
    if (!trip.interests?.length) assumed.push('Chưa có sở thích ưu tiên.');
    if (!origin) assumed.push('Không tính chặng từ vị trí xuất phát; điểm đầu là trải nghiệm đầu tiên.');

    const constraints: ItineraryRequest = {
      date: trip.date!,
      startTime: trip.startTime ?? '08:00',
      endTime: trip.endTime ?? '17:00',
      adults,
      children,
      budgetVnd: trip.budgetVnd,
      budgetBasis: (trip.budgetBasis ?? 'GROUP') as BudgetBasis,
      transportMode: (trip.transportMode ?? 'car') as TransportMode,
      interests: trip.interests ?? [],
      maxStops: 4,
      origin,
      returnTo: trip.returnToOrigin ? origin : undefined,
    };
    const services = await getVerifiedCandidates(constraints.date);
    const plan = await buildItinerary(
      constraints,
      services,
      process.env.GOONG_API_KEY ? getGoongRoute : undefined,
    );
    const outcome = plan.feasibility === 'NO_FEASIBLE_PLAN' ? 'NO_FEASIBLE_PLAN' : plan.feasibility;
    await recordUsage({ userId: user?.id, requestId, mode: extracted.mode, outcome, inputTokens: extracted.inputTokens, outputTokens: extracted.outputTokens });

    const assistantMessage = plan.feasibility === 'NO_FEASIBLE_PLAN'
      ? 'Mình chưa tìm được lịch trình phù hợp từ các dịch vụ đã xác minh và còn chỗ trong ngày bạn chọn. Bạn có thể đổi ngày, khung giờ hoặc số người.'
      : `Mình đã xếp ${plan.stops.length} trải nghiệm từ dữ liệu nhà vườn đã xác minh.${plan.hasUnknownCosts ? ' Một số khoản giá cần nhà vườn xác nhận.' : ''}`;
    return NextResponse.json({
      requestId,
      status: plan.feasibility,
      assistantMessage,
      trip: constraints,
      plan: { ...plan, warnings: Array.from(new Set([...plan.warnings, ...assumed])) },
      monthContext: monthContext(),
      mode: extracted.mode === 'GEMINI' ? 'GEMINI_PLUS_RULE_BASED_PLANNER' : 'RULE_BASED_FALLBACK',
      map: { provider: process.env.GOONG_API_KEY ? 'Goong Directions' : null, routesAvailable: Boolean(process.env.GOONG_API_KEY) },
    });
  } catch {
    return NextResponse.json({
      requestId,
      error: 'Không thể tạo lịch trình do cơ sở dữ liệu hoặc dịch vụ phụ trợ đang tạm thời không truy cập được.',
    }, { status: 503 });
  }
}
