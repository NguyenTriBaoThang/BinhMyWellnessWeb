import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { buildItinerary, type ItineraryRequest } from '@/lib/itinerary/engine';
import { getVerifiedCandidates } from '@/lib/itinerary/catalog';
import { getGoongRoute } from '@/lib/routing/goong';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Đăng nhập tài khoản khách hàng để xem hành trình.' }, { status: 401 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Hành trình cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: params.id, customerId: user.id },
      include: { stops: { include: { service: { include: { provider: true } }, booking: true }, orderBy: { position: 'asc' } } },
    });
    return itinerary ? NextResponse.json({ itinerary }) : NextResponse.json({ error: 'Không tìm thấy hành trình.' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Không thể tải hành trình lúc này.' }, { status: 503 });
  }
}

function readTrip(value: unknown): ItineraryRequest | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)
    || typeof input.startTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startTime)
    || typeof input.endTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.endTime)
    || typeof input.adults !== 'number' || !Number.isInteger(input.adults) || input.adults < 0 || input.adults > 50
    || typeof input.children !== 'number' || !Number.isInteger(input.children) || input.children < 0 || input.children > 50
    || !['GROUP', 'PER_PERSON'].includes(String(input.budgetBasis))
    || !['car', 'bike', 'walk'].includes(String(input.transportMode))) return null;
  if (input.budgetVnd !== undefined && input.budgetVnd !== null
    && (typeof input.budgetVnd !== 'number' || !Number.isSafeInteger(input.budgetVnd) || input.budgetVnd < 0 || input.budgetVnd > 1_000_000_000)) return null;
  const point = (item: unknown): item is { latitude: number; longitude: number; label?: string } => !!item && typeof item === 'object'
    && typeof (item as Record<string, unknown>).latitude === 'number' && Number.isFinite((item as Record<string, unknown>).latitude)
    && Number((item as Record<string, unknown>).latitude) >= -90 && Number((item as Record<string, unknown>).latitude) <= 90
    && typeof (item as Record<string, unknown>).longitude === 'number' && Number.isFinite((item as Record<string, unknown>).longitude)
    && Number((item as Record<string, unknown>).longitude) >= -180 && Number((item as Record<string, unknown>).longitude) <= 180
    && ((item as Record<string, unknown>).label === undefined || (typeof (item as Record<string, unknown>).label === 'string' && String((item as Record<string, unknown>).label).length <= 100));
  if (input.origin !== undefined && !point(input.origin)) return null;
  if (input.returnTo !== undefined && !point(input.returnTo)) return null;
  return {
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    adults: input.adults,
    children: input.children,
    budgetVnd: typeof input.budgetVnd === 'number' ? input.budgetVnd : undefined,
    budgetBasis: input.budgetBasis as ItineraryRequest['budgetBasis'],
    transportMode: input.transportMode as ItineraryRequest['transportMode'],
    interests: Array.isArray(input.interests) ? input.interests.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 100)).slice(0, 8) : [],
    maxStops: 4,
    origin: input.origin as ItineraryRequest['origin'],
    returnTo: input.returnTo as ItineraryRequest['returnTo'],
  };
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Đăng nhập tài khoản khách hàng để sửa hành trình.' }, { status: 401 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Sửa hành trình cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: params.id, customerId: user.id },
      include: { stops: { include: { booking: true } } },
    });
    if (!itinerary) return NextResponse.json({ error: 'Không tìm thấy hành trình.' }, { status: 404 });
    if (itinerary.status !== 'SAVED' || itinerary.stops.some((stop) => stop.booking)) {
      return NextResponse.json({ error: 'Chỉ sửa được hành trình chưa gửi đặt chỗ.' }, { status: 409 });
    }
    const body = await request.json() as Record<string, unknown>;
    const trip = readTrip(body.trip);
    if (!trip || trip.adults + trip.children < 1 || trip.adults + trip.children > 50) return NextResponse.json({ error: 'Thông tin hành trình không hợp lệ.' }, { status: 400 });
    if ((trip.origin || trip.returnTo) && body.allowExternalRouting !== true) return NextResponse.json({ error: 'Cần xác nhận gửi tọa độ đến dịch vụ định tuyến.' }, { status: 400 });
    const plan = await buildItinerary(trip, await getVerifiedCandidates(trip.date), process.env.GOONG_API_KEY ? getGoongRoute : undefined);
    if (!plan.stops.length) return NextResponse.json({ error: 'Không có điểm dừng khả thi để lưu.', plan }, { status: 409 });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM itineraries WHERE id = ${itinerary.id} FOR UPDATE`;
      const fresh = await tx.itinerary.findUnique({ where: { id: itinerary.id }, include: { stops: { include: { booking: true } } } });
      if (!fresh || fresh.status !== 'SAVED' || fresh.stops.some((stop) => stop.booking)) throw new Error('ITINERARY_NOT_EDITABLE');
      return tx.itinerary.update({
      where: { id: itinerary.id },
      data: {
        date: trip.date, adults: trip.adults, children: trip.children, budgetVnd: trip.budgetVnd,
        budgetBasis: trip.budgetBasis, startTime: trip.startTime, endTime: trip.endTime,
        transportMode: trip.transportMode, originLatitude: trip.origin?.latitude,
        originLongitude: trip.origin?.longitude, originLabel: trip.origin?.label,
        returnLatitude: trip.returnTo?.latitude, returnLongitude: trip.returnTo?.longitude,
        returnLabel: trip.returnTo?.label, totalCostVnd: plan.totalCostVnd,
        returnTravelMinutes: plan.returnRoute?.durationMinutes,
        returnDistanceM: plan.returnRoute?.distanceMeters,
        returnRouteProvider: plan.returnRoute?.provider,
        returnRouteGeometry: plan.returnRoute?.encodedPolyline,
        knownCostVnd: plan.knownCostVnd, hasUnknownCosts: plan.hasUnknownCosts,
        fallbackMode: plan.fallbackMode, warnings: plan.warnings as Prisma.InputJsonValue,
        constraints: JSON.parse(JSON.stringify(trip)) as Prisma.InputJsonValue,
        stops: {
          deleteMany: {},
          create: plan.stops.map((stop, index) => ({
            serviceId: stop.serviceId, position: index, date: stop.date, slot: stop.slot,
            arrivalTime: stop.arrivalTime, departureTime: stop.departureTime,
            travelFromPreviousMin: stop.routeFromPrevious?.durationMinutes,
            distanceFromPreviousM: stop.routeFromPrevious?.distanceMeters,
            routeProvider: stop.routeFromPrevious?.provider,
            routeGeometry: stop.routeFromPrevious?.encodedPolyline,
            estimatedCostVnd: stop.costVnd, costKnown: stop.costVnd !== null,
            availabilityCheckedAt: new Date(),
          })),
        },
      },
      include: { stops: { include: { service: { include: { provider: true } } }, orderBy: { position: 'asc' } } },
    });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ success: true, itinerary: updated, plan });
  } catch (error) {
    if (error instanceof Error && error.message === 'ITINERARY_NOT_EDITABLE') return NextResponse.json({ error: 'Hành trình vừa được gửi đặt chỗ và không còn chỉnh sửa được.' }, { status: 409 });
    return NextResponse.json({ error: 'Không thể cập nhật hành trình lúc này.' }, { status: 503 });
  }
}
