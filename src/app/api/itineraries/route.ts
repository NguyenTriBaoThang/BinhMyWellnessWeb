import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { buildItinerary, type ItineraryRequest } from '@/lib/itinerary/engine';
import { getVerifiedCandidates } from '@/lib/itinerary/catalog';
import { getGoongRoute } from '@/lib/routing/goong';
import { prisma } from '@/lib/prisma';

function coordinate(value: unknown): value is { latitude: number; longitude: number; label?: string } {
  if (!value || typeof value !== 'object') return false;
  const point = value as Record<string, unknown>;
  return typeof point.latitude === 'number' && Number.isFinite(point.latitude) && point.latitude >= -90 && point.latitude <= 90
    && typeof point.longitude === 'number' && Number.isFinite(point.longitude) && point.longitude >= -180 && point.longitude <= 180
    && (point.label === undefined || (typeof point.label === 'string' && point.label.length <= 100));
}

function readRequest(value: unknown): ItineraryRequest | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)
    || typeof input.startTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startTime)
    || typeof input.endTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.endTime)
    || !Number.isInteger(input.adults) || Number(input.adults) < 0 || Number(input.adults) > 50
    || !Number.isInteger(input.children) || Number(input.children) < 0 || Number(input.children) > 50
    || !['GROUP', 'PER_PERSON'].includes(String(input.budgetBasis))
    || !['car', 'bike', 'walk'].includes(String(input.transportMode))) return null;
  if (input.budgetVnd !== undefined && input.budgetVnd !== null
    && (!Number.isSafeInteger(input.budgetVnd) || Number(input.budgetVnd) < 0 || Number(input.budgetVnd) > 1_000_000_000)) return null;
  if (input.origin !== undefined && !coordinate(input.origin)) return null;
  if (input.returnTo !== undefined && !coordinate(input.returnTo)) return null;
  return {
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    adults: Number(input.adults),
    children: Number(input.children),
    budgetVnd: input.budgetVnd === undefined || input.budgetVnd === null ? undefined : Number(input.budgetVnd),
    budgetBasis: input.budgetBasis as ItineraryRequest['budgetBasis'],
    transportMode: input.transportMode as ItineraryRequest['transportMode'],
    interests: Array.isArray(input.interests) ? input.interests.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 100)).slice(0, 8) : [],
    maxStops: 4,
    origin: input.origin as ItineraryRequest['origin'],
    returnTo: input.returnTo as ItineraryRequest['returnTo'],
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Đăng nhập tài khoản khách hàng để xem hành trình.' }, { status: 401 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Hành trình cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const itineraries = await prisma.itinerary.findMany({
      where: { customerId: user.id },
      include: { stops: { include: { service: { include: { provider: true } }, booking: true }, orderBy: { position: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });
    return NextResponse.json({ itineraries });
  } catch {
    return NextResponse.json({ error: 'Không thể tải hành trình lúc này.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Đăng nhập tài khoản khách hàng để lưu hành trình.' }, { status: 401 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Lưu hành trình cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const body = await request.json() as Record<string, unknown>;
    const trip = readRequest(body.trip);
    if (!trip || trip.adults + trip.children < 1 || trip.adults + trip.children > 50) {
      return NextResponse.json({ error: 'Thông tin hành trình không hợp lệ.' }, { status: 400 });
    }
    if ((trip.origin || trip.returnTo) && body.allowExternalRouting !== true) {
      return NextResponse.json({ error: 'Cần xác nhận gửi tọa độ đến dịch vụ định tuyến.' }, { status: 400 });
    }
    const candidates = await getVerifiedCandidates(trip.date);
    const plan = await buildItinerary(trip, candidates, process.env.GOONG_API_KEY ? getGoongRoute : undefined);
    if (!plan.stops.length) return NextResponse.json({ error: 'Không có điểm dừng khả thi để lưu.', plan }, { status: 409 });

    const code = `BM-IT-${randomUUID().slice(0, 10).toUpperCase()}`;
    const saved = await prisma.itinerary.create({
      data: {
        code,
        customerId: user.id,
        date: trip.date,
        adults: trip.adults,
        children: trip.children,
        budgetVnd: trip.budgetVnd,
        budgetBasis: trip.budgetBasis,
        startTime: trip.startTime,
        endTime: trip.endTime,
        transportMode: trip.transportMode,
        originLatitude: trip.origin?.latitude,
        originLongitude: trip.origin?.longitude,
        originLabel: trip.origin?.label,
        returnLatitude: trip.returnTo?.latitude,
        returnLongitude: trip.returnTo?.longitude,
        returnLabel: trip.returnTo?.label,
        returnTravelMinutes: plan.returnRoute?.durationMinutes,
        returnDistanceM: plan.returnRoute?.distanceMeters,
        returnRouteProvider: plan.returnRoute?.provider,
        returnRouteGeometry: plan.returnRoute?.encodedPolyline,
        totalCostVnd: plan.totalCostVnd,
        knownCostVnd: plan.knownCostVnd,
        hasUnknownCosts: plan.hasUnknownCosts,
        fallbackMode: plan.fallbackMode,
        explanation: `Lưu từ planner xác định; chế độ tuyến đường ${process.env.GOONG_API_KEY ? 'Goong' : 'không khả dụng'}.`,
        warnings: plan.warnings as Prisma.InputJsonValue,
        constraints: JSON.parse(JSON.stringify(trip)) as Prisma.InputJsonValue,
        stops: {
          create: plan.stops.map((stop, index) => ({
            serviceId: stop.serviceId,
            position: index,
            date: stop.date,
            slot: stop.slot,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
            travelFromPreviousMin: stop.routeFromPrevious?.durationMinutes,
            distanceFromPreviousM: stop.routeFromPrevious?.distanceMeters,
            routeProvider: stop.routeFromPrevious?.provider,
            routeGeometry: stop.routeFromPrevious?.encodedPolyline,
            estimatedCostVnd: stop.costVnd,
            costKnown: stop.costVnd !== null,
            availabilityCheckedAt: new Date(),
          })),
        },
      },
      include: { stops: { include: { service: { include: { provider: true } } }, orderBy: { position: 'asc' } } },
    });
    return NextResponse.json({ success: true, itinerary: saved, plan }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Không thể lưu hành trình lúc này.' }, { status: 503 });
  }
}
