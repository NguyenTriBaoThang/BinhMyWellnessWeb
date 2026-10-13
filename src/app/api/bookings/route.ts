import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem thông tin đặt chỗ.' },
        { status: 401 }
      );
    }

    let bookings;
    if (user.role === 'ADMIN') {
      bookings = await db.getBookings();
    } else if (user.role === 'PROVIDER') {
      bookings = await db.getBookings({ providerId: user.providerProfileId || 'p1' });
    } else {
      bookings = await db.getBookings({ customerId: user.id });
    }

    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const customerId = user?.id || 'guest-' + Date.now().toString(36);
    const customerName = body.name || user?.name || 'Khách trải nghiệm';
    const customerPhone = body.phone || user?.phone || '0901234567';

    if (!body.serviceId || !body.date || !body.slot || !body.people) {
      return NextResponse.json(
        { error: 'Vui lòng chọn dịch vụ, ngày, khung giờ và số người tham gia.' },
        { status: 400 }
      );
    }

    const booking = await db.createBooking({
      serviceId: body.serviceId,
      customerId,
      customerName,
      customerPhone,
      notes: body.notes,
      date: body.date,
      slot: body.slot,
      people: Number(body.people),
      source: body.source || 'Trực tiếp',
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Đặt lịch thành công! Nhà vườn sẽ sớm liên hệ xác nhận.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
