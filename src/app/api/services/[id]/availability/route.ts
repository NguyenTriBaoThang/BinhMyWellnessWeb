import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { getTodayInVietnam } from '@/lib/utils';

function parseDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? null : value;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !['PROVIDER', 'ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Đăng nhập nhà vườn hoặc quản trị viên để xem lịch.' }, { status: 403 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const service = await prisma.service.findUnique({ where: { id: params.id }, include: { provider: { select: { userId: true, id: true } } } });
    if (!service || (user.role === 'PROVIDER' && (service.provider.userId !== user.id || service.provider.id !== user.providerProfileId))) {
      return NextResponse.json({ error: 'Không tìm thấy dịch vụ thuộc phạm vi của bạn.' }, { status: 404 });
    }
    const date = new URL(request.url).searchParams.get('date');
    if (date && !parseDate(date)) return NextResponse.json({ error: 'Ngày lịch không hợp lệ.' }, { status: 400 });
    const availability = await prisma.serviceAvailability.findMany({
      where: { serviceId: service.id, ...(date && parseDate(date) ? { date: new Date(`${date}T00:00:00.000Z`) } : {}) },
      orderBy: [{ date: 'asc' }, { slot: 'asc' }],
      take: 500,
    });
    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json({ error: 'Không thể tải lịch lúc này.' }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'PROVIDER' || !user.providerProfileId) {
      return NextResponse.json({ error: 'Chỉ nhà vườn được cập nhật lịch dịch vụ.' }, { status: 403 });
    }
    if (!isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Cập nhật lịch cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    }

    const body = await request.json() as Record<string, unknown>;
    const date = parseDate(body.date);
    if (!date || date < getTodayInVietnam()) {
      return NextResponse.json({ error: 'Ngày cập nhật không hợp lệ hoặc đã qua.' }, { status: 400 });
    }
    if (!Array.isArray(body.slots) || body.slots.length > 20
      || body.slots.some((slot) => typeof slot !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot))) {
      return NextResponse.json({ error: 'Chọn các khung giờ hợp lệ.' }, { status: 400 });
    }
    const selectedSlots = Array.from(new Set(body.slots as string[]));
    if (typeof body.sourceNote === 'string' && body.sourceNote.length > 200) {
      return NextResponse.json({ error: 'Ghi chú nguồn không được quá 200 ký tự.' }, { status: 400 });
    }
    const capacity = body.capacity === undefined ? undefined : Number(body.capacity);
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
      return NextResponse.json({ error: 'Sức chứa phải là số nguyên dương.' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: { provider: { select: { id: true, userId: true } } },
    });
    if (!service || service.providerId !== user.providerProfileId || service.provider.userId !== user.id) {
      return NextResponse.json({ error: 'Không tìm thấy dịch vụ thuộc nhà vườn của bạn.' }, { status: 404 });
    }
    if (service.status !== 'PUBLISHED' || selectedSlots.some((slot) => !service.slots.includes(slot))) {
      return NextResponse.json({ error: 'Dịch vụ chưa công bố hoặc có khung giờ ngoài lịch dịch vụ.' }, { status: 400 });
    }
    if (capacity !== undefined && capacity > service.capacity) {
      return NextResponse.json({ error: `Sức chứa không được vượt quá ${service.capacity} khách.` }, { status: 400 });
    }

    const dateValue = new Date(`${date}T00:00:00.000Z`);
    const sourceNote = typeof body.sourceNote === 'string' ? body.sourceNote.trim() || null : null;
    await prisma.$transaction(async (tx) => {
      for (const slot of [...service.slots].sort()) {
        const isOpen = selectedSlots.includes(slot);
        const lockKey = `${service.id}|${date}|${slot}`;
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
        const existing = await tx.serviceAvailability.findUnique({ where: { serviceId_date_slot: { serviceId: service.id, date: dateValue, slot } } });
        if (existing) {
          await tx.$queryRaw`SELECT id FROM service_availability WHERE id = ${existing.id} FOR UPDATE`;
        }
        const reserved = await tx.booking.aggregate({
          where: {
            serviceId: service.id,
            OR: [
              { date, slot, status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] } },
              { proposalDate: date, proposalSlot: slot, status: 'PROPOSED' },
            ],
          },
          _sum: { people: true },
        });
        const booked = reserved._sum.people ?? 0;
        if ((!isOpen && booked > 0) || (isOpen && capacity !== undefined && booked > capacity)) {
          throw new Error('BOOKING_CAPACITY_CONFLICT');
        }
        await tx.serviceAvailability.upsert({
          where: { serviceId_date_slot: { serviceId: service.id, date: dateValue, slot } },
          create: {
            serviceId: service.id, date: dateValue, slot,
            capacity: isOpen ? capacity ?? null : null,
            status: isOpen ? 'AVAILABLE' : 'CLOSED', verifiedAt: null, sourceNote,
          },
          update: {
            capacity: isOpen ? capacity ?? null : null,
            status: isOpen ? 'AVAILABLE' : 'CLOSED', verifiedAt: null, sourceNote,
          },
        });
      }
    }, { isolationLevel: 'Serializable' });

    await prisma.auditLog.create({
      data: {
        actor: user.name,
        action: 'Cập nhật lịch trống',
        target: service.name,
        detail: `${date}: ${selectedSlots.length} khung giờ được đánh dấu; cần quản trị viên xác minh trước khi lập lịch.`,
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true, date, slots: selectedSlots, requiresAdminVerification: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOKING_CAPACITY_CONFLICT') {
      return NextResponse.json({ error: 'Không thể đóng ca hoặc giảm sức chứa dưới số khách đã được giữ chỗ.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Không thể cập nhật lịch trống lúc này.' }, { status: 500 });
  }
}
