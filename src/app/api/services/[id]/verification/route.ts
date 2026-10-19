import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';

function validCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Only administrators can verify planner data.' }, { status: 403 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'A configured database is required.' }, { status: 503 });

    const body = await request.json() as Record<string, unknown>;
    const service = await prisma.service.findUnique({ where: { id: params.id } });
    if (!service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    if (service.status !== 'PUBLISHED') return NextResponse.json({ error: 'Only published services can be verified.' }, { status: 409 });

    const verifyService = body.serviceVerified === true;
    const verifyLocation = body.locationVerified === true;
    const latitude = body.latitude === undefined ? service.latitude : body.latitude;
    const longitude = body.longitude === undefined ? service.longitude : body.longitude;
    const areaCode = body.areaCode === undefined ? service.areaCode : body.areaCode;
    if (verifyLocation && (!validCoordinate(latitude, 10.2, 11.4)
      || !validCoordinate(longitude, 106.2, 107.2) || areaCode !== 'BINH_MY')) {
      return NextResponse.json({ error: 'Verified location needs valid coordinates and area code BINH_MY.' }, { status: 400 });
    }
    if (body.availability !== undefined && (!Array.isArray(body.availability) || body.availability.length > 100)) {
      return NextResponse.json({ error: 'Invalid availability verification list.' }, { status: 400 });
    }

    const requested: Array<{ date: string; slot: string }> = [];
    if (Array.isArray(body.availability)) {
      for (const entry of body.availability) {
        if (!entry || typeof entry !== 'object') return NextResponse.json({ error: 'Invalid availability entry.' }, { status: 400 });
        const item = entry as Record<string, unknown>;
        if (!validDate(item.date) || typeof item.slot !== 'string' || !service.slots.includes(item.slot)) {
          return NextResponse.json({ error: 'Invalid availability date or slot.' }, { status: 400 });
        }
        requested.push({ date: item.date, slot: item.slot });
      }
    }
    const uniqueRequested = Array.from(new Map(requested.map((item) => [`${item.date}|${item.slot}`, item])).values())
      .sort((left, right) => `${left.date}|${left.slot}`.localeCompare(`${right.date}|${right.slot}`));
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const openService = await tx.service.findFirst({ where: { id: service.id, status: 'PUBLISHED' }, select: { id: true } });
      if (!openService) throw new Error('SERVICE_NO_LONGER_PUBLISHED');
      const availabilityIds: string[] = [];
      for (const item of uniqueRequested) {
        const date = new Date(`${item.date}T00:00:00.000Z`);
        const lockKey = `${service.id}|${item.date}|${item.slot}`;
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
        const row = await tx.serviceAvailability.findUnique({
          where: { serviceId_date_slot: { serviceId: service.id, date, slot: item.slot } },
          select: { id: true, status: true },
        });
        if (!row || row.status !== 'AVAILABLE') throw new Error('AVAILABILITY_CHANGED');
        availabilityIds.push(row.id);
      }

      const updatedService = await tx.service.updateMany({
        where: { id: service.id, status: 'PUBLISHED' },
        data: {
          serviceVerifiedAt: body.serviceVerified === false ? null : verifyService ? now : undefined,
          locationVerifiedAt: body.locationVerified === false ? null : verifyLocation ? now : undefined,
          latitude: verifyLocation && typeof latitude === 'number' ? latitude : undefined,
          longitude: verifyLocation && typeof longitude === 'number' ? longitude : undefined,
          areaCode: verifyLocation && typeof areaCode === 'string' ? areaCode : undefined,
        },
      });
      if (updatedService.count !== 1) throw new Error('SERVICE_NO_LONGER_PUBLISHED');
      if (availabilityIds.length) {
        await tx.serviceAvailability.updateMany({ where: { id: { in: availabilityIds } }, data: { verifiedAt: now } });
      }
      await tx.auditLog.create({
        data: {
          actor: user.name,
          action: 'Planner data verification',
          target: service.name,
          detail: `Service ${verifyService ? 'verified' : 'unchanged'}; location ${verifyLocation ? 'verified' : 'unchanged'}; ${availabilityIds.length} slots verified.`,
          userId: user.id,
        },
      });
      return availabilityIds.length;
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json({ success: true, verifiedAvailabilityCount: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'AVAILABILITY_CHANGED') {
      return NextResponse.json({ error: 'An availability slot changed while verification was in progress. Reload and review it again.' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'SERVICE_NO_LONGER_PUBLISHED') {
      return NextResponse.json({ error: 'The service is no longer published.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Could not verify planner data.' }, { status: 503 });
  }
}
