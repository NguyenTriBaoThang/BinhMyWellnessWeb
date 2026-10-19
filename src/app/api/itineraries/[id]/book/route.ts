import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { getTodayInVietnam, isBookableSlotInVietnam } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

const RESERVED_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED'] as const;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Đăng nhập tài khoản khách hàng để gửi yêu cầu.' }, { status: 401 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Đặt nhiều điểm cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });

    const body = await request.json() as Record<string, unknown>;
    const key = request.headers.get('Idempotency-Key') || (typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '');
    if (!/^[A-Za-z0-9._:-]{12,100}$/.test(key)) return NextResponse.json({ error: 'Thiếu khóa gửi yêu cầu hợp lệ.' }, { status: 400 });
    if (body.confirm !== true) return NextResponse.json({ error: 'Cần xác nhận hành trình trước khi gửi yêu cầu đặt chỗ.' }, { status: 400 });
    const customerName = typeof body.name === 'string' ? body.name.trim() : user.name;
    const customerPhone = typeof body.phone === 'string' ? body.phone.trim() : user.phone || '';
    if (customerName.length < 2 || customerName.length > 100 || customerPhone.replace(/\D/g, '').length < 9 || customerPhone.replace(/\D/g, '').length > 12) {
      return NextResponse.json({ error: 'Cần tên và số điện thoại hợp lệ để nhà vườn xác nhận.' }, { status: 400 });
    }

    const itinerary = await prisma.itinerary.findFirst({
      where: { id: params.id, customerId: user.id },
      include: { stops: { include: { service: { include: { provider: true } }, booking: true }, orderBy: { position: 'asc' } } },
    });
    if (!itinerary) return NextResponse.json({ error: 'Không tìm thấy hành trình.' }, { status: 404 });
    const existingBookings = await prisma.booking.findMany({
      where: { OR: [{ itineraryStopId: { in: itinerary.stops.map((stop) => stop.id) } }, { idempotencyKey: { startsWith: `${key}:` } }] },
      include: { service: true },
    });
    const existingByStop = new Map(existingBookings.filter((booking) => booking.itineraryStopId).map((booking) => [booking.itineraryStopId!, booking]));
    if (itinerary.stops.length > 0 && itinerary.stops.every((stop) => existingByStop.has(stop.id))) {
      return NextResponse.json({ success: true, bookings: itinerary.stops.map((stop) => existingByStop.get(stop.id)), itineraryStatus: itinerary.status });
    }
    if (itinerary.hasUnknownCosts || itinerary.stops.some((stop) => !stop.costKnown || stop.estimatedCostVnd === null)) {
      return NextResponse.json({ error: 'Có điểm chưa xác định được giá. Hãy xác nhận giá với nhà vườn trước khi gửi yêu cầu đặt chỗ.' }, { status: 409 });
    }
    if (itinerary.date < getTodayInVietnam() || itinerary.stops.some((stop) => !isBookableSlotInVietnam(stop.date, stop.slot))) {
      return NextResponse.json({ error: 'Một hoặc nhiều khung giờ đã qua; hãy tạo lịch trình mới.' }, { status: 409 });
    }

    const created = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM itineraries WHERE id = ${itinerary.id} FOR UPDATE`;
      const freshItinerary = await tx.itinerary.findUnique({ where: { id: itinerary.id }, select: { status: true } });
      if (!freshItinerary) throw new Error('ITINERARY_NOT_FOUND');
      const freshStops = await tx.itineraryStop.findMany({ where: { itineraryId: itinerary.id }, include: { booking: true }, orderBy: { position: 'asc' } });
      const currentByStop = new Map(freshStops.filter((stop) => stop.booking).map((stop) => [stop.id, stop.booking!]));
      if (freshStops.length > 0 && freshStops.every((stop) => currentByStop.has(stop.id))) {
        return { results: freshStops.map((stop) => currentByStop.get(stop.id)), status: freshItinerary.status };
      }
      if (freshItinerary.status !== 'SAVED') throw new Error('ITINERARY_NOT_EDITABLE');
      const lockOrder = [...itinerary.stops].sort((left, right) => `${left.serviceId}|${left.date}|${left.slot}`.localeCompare(`${right.serviceId}|${right.date}|${right.slot}`));
      for (const stop of lockOrder) {
        const lockKey = `${stop.serviceId}|${stop.date}|${stop.slot}`;
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
      }
      const results = [];
      for (const stop of itinerary.stops) {
        const prior = currentByStop.get(stop.id) ?? existingByStop.get(stop.id);
        if (prior) {
          if (prior.customerId !== user.id) throw new Error('IDEMPOTENCY_CONFLICT');
          results.push(prior);
          continue;
        }
        const date = new Date(`${stop.date}T00:00:00.000Z`);
        const service = await tx.service.findFirst({
          where: {
            id: stop.serviceId,
            status: 'PUBLISHED',
            testOnly: false,
            areaCode: 'BINH_MY',
            serviceVerifiedAt: { not: null },
            locationVerifiedAt: { not: null },
            provider: { active: true },
          },
          include: { provider: true },
        });
        if (!service || !service.slots.includes(stop.slot)) throw new Error('SERVICE_UNAVAILABLE');

        const availability = await tx.serviceAvailability.findUnique({
          where: { serviceId_date_slot: { serviceId: service.id, date, slot: stop.slot } },
        });
        if (!availability || availability.status !== 'AVAILABLE' || !availability.verifiedAt) throw new Error('SLOT_UNVERIFIED');
        await tx.$queryRaw`SELECT id FROM service_availability WHERE "serviceId" = ${service.id} AND date = ${date}::date AND slot = ${stop.slot} FOR UPDATE`;
        const reserved = await tx.booking.aggregate({
          where: {
            serviceId: service.id,
            OR: [
              { date: stop.date, slot: stop.slot, status: { in: [...RESERVED_STATUSES] } },
              { proposalDate: stop.date, proposalSlot: stop.slot, status: 'PROPOSED' },
            ],
          },
          _sum: { people: true },
        });
        const capacity = Math.min(service.capacity, availability.capacity ?? service.capacity);
        const people = itinerary.adults + itinerary.children;
        if (people < 1 || (reserved._sum.people ?? 0) + people > capacity) throw new Error('CAPACITY_CHANGED');

        const booking = await tx.booking.create({
          data: {
            code: `BM-${randomUUID().slice(0, 12).toUpperCase()}`,
            serviceId: service.id,
            providerId: service.providerId,
            customerId: user.id,
            customerName,
            customerPhone,
            notes: `Yêu cầu qua hành trình ${itinerary.code}. Nhà vườn vui lòng xác nhận lịch và giá thực tế.`,
            date: stop.date,
            slot: stop.slot,
            people,
            price: service.price,
            total: stop.estimatedCostVnd!,
            duration: service.duration,
            status: 'PENDING',
            source: 'Hành trình Bình Mỹ',
            itineraryStopId: stop.id,
            idempotencyKey: `${key}:${stop.id}`,
            history: { create: { status: 'PENDING', actor: customerName, message: `Khách gửi yêu cầu từ hành trình ${itinerary.code}.` } },
          },
          include: { service: true, provider: true },
        });
        results.push(booking);
      }
      const status = 'BOOKING_REQUESTED' as const;
      await tx.itinerary.update({ where: { id: itinerary.id }, data: { status } });
      return { results, status };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ success: true, bookings: created.results, itineraryStatus: created.status }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Yêu cầu đã được nhận. Tải lại hành trình để xem trạng thái.' }, { status: 409 });
    }
    const reason = error instanceof Error ? error.message : '';
    const status = ['SERVICE_UNAVAILABLE', 'SLOT_UNVERIFIED', 'CAPACITY_CHANGED', 'IDEMPOTENCY_CONFLICT', 'ITINERARY_NOT_EDITABLE'].includes(reason) ? 409 : 503;
    const message: Record<string, string> = {
      SERVICE_UNAVAILABLE: 'Một dịch vụ không còn đủ điều kiện nhận đặt chỗ.',
      SLOT_UNVERIFIED: 'Một ca chưa được xác minh hoặc đã đóng.',
      CAPACITY_CHANGED: 'Sức chứa vừa thay đổi; hãy tạo lại hành trình.',
      IDEMPOTENCY_CONFLICT: 'Khóa gửi yêu cầu đã được dùng cho khách hàng khác.',
      ITINERARY_NOT_EDITABLE: 'Hành trình không còn ở trạng thái có thể gửi đặt chỗ.',
    };
    return NextResponse.json({ error: message[reason] || 'Không thể gửi yêu cầu đặt chỗ lúc này.' }, { status });
  }
}
