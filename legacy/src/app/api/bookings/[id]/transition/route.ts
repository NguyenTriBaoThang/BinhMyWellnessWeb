import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác.' },
        { status: 401 }
      );
    }

    const { action, extra } = await req.json();
    const validActions = ['confirm', 'propose', 'accept', 'reject', 'cancel', 'complete'];
    if (typeof action !== 'string' || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Thao tác cập nhật không hợp lệ.' }, { status: 400 });
    }
    if (
      action === 'propose' &&
      (!extra || typeof extra.date !== 'string' || typeof extra.slot !== 'string' || typeof extra.reason !== 'string')
    ) {
      return NextResponse.json({ error: 'Lịch đề xuất chưa đủ ngày, ca và lý do.' }, { status: 400 });
    }
    if (extra?.reason !== undefined && (typeof extra.reason !== 'string' || extra.reason.length > 500)) {
      return NextResponse.json({ error: 'Lý do không hợp lệ hoặc vượt quá 500 ký tự.' }, { status: 400 });
    }
    const bookingAction = action as 'confirm' | 'propose' | 'accept' | 'reject' | 'cancel' | 'complete';
    const existingBooking = await db.getBookingById(params.id);
    if (!existingBooking) {
      return NextResponse.json({ error: 'Không tìm thấy yêu cầu đặt chỗ.' }, { status: 404 });
    }

    if (user.role === 'CUSTOMER' && existingBooking.customerId !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền cập nhật yêu cầu này.' }, { status: 403 });
    }
    if (user.role === 'PROVIDER') {
      const provider = await db.getProviderByUserId(user.id);
      if (!provider || existingBooking.providerId !== provider.id) {
        return NextResponse.json({ error: 'Yêu cầu này không thuộc nhà vườn của bạn.' }, { status: 403 });
      }
    }

    const booking = await db.transitionBooking(
      params.id,
      bookingAction,
      user.role,
      user.name,
      extra
    );

    if (isPersistentDatabaseConfigured()) {
      const bookingLink = await prisma.booking.findUnique({ where: { id: booking.id }, select: { itineraryStopId: true } });
      const stop = bookingLink?.itineraryStopId
        ? await prisma.itineraryStop.findUnique({ where: { id: bookingLink.itineraryStopId }, select: { itineraryId: true } })
        : null;
      if (stop) {
        const itinerary = await prisma.itinerary.findUnique({ where: { id: stop.itineraryId }, include: { stops: { include: { booking: { select: { status: true } } } } } });
        if (itinerary) {
          const statuses = itinerary.stops.map((item) => item.booking?.status ?? 'UNBOOKED');
          const allCompleted = statuses.length > 0 && statuses.every((status) => status === 'COMPLETED');
          const allConfirmed = statuses.length > 0 && statuses.every((status) => status === 'CONFIRMED' || status === 'COMPLETED');
          const anyResponded = statuses.some((status) => ['CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(status));
          const allTerminal = statuses.every((status) => ['CANCELLED', 'REJECTED'].includes(status));
          const status = allCompleted ? 'COMPLETED' : allConfirmed ? 'CONFIRMED' : allTerminal ? 'CANCELLED' : anyResponded ? 'PARTIALLY_CONFIRMED' : 'BOOKING_REQUESTED';
          await prisma.itinerary.update({ where: { id: itinerary.id }, data: { status } });
        }
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Cập nhật trạng thái yêu cầu thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
