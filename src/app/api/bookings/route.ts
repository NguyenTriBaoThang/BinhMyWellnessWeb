import { NextResponse } from 'next/server';
import { db, isPersistentDatabaseConfigured, isTestBookingModeEnabled } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getTodayInVietnam, isBookableSlotInVietnam } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production' && !isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Website chưa được kết nối cơ sở dữ liệu đặt chỗ.' }, { status: 503 });
    }
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
      const provider = await db.getProviderByUserId(user.id);
      bookings = provider ? await db.getBookings({ providerId: provider.id }) : [];
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
    if (process.env.NODE_ENV === 'production' && !isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Website chưa được kết nối cơ sở dữ liệu đặt chỗ.' }, { status: 503 });
    }
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập bằng tài khoản khách hàng để đặt trải nghiệm.' },
        { status: 401 }
      );
    }
    const body = await req.json();

    const customerId = user.id;
    const customerName = String(body.name ?? user.name ?? '').trim();
    const customerPhone = String(body.phone ?? user.phone ?? '').trim();
    const date = String(body.date ?? '');
    const people = Number(body.people);

    if (typeof body.serviceId !== 'string' || !body.serviceId || !date || typeof body.slot !== 'string' || !body.slot || !Number.isInteger(people)) {
      return NextResponse.json(
        { error: 'Vui lòng chọn dịch vụ, ngày, khung giờ và số người tham gia.' },
        { status: 400 }
      );
    }

    const requestedService = await db.getServiceById(body.serviceId);
    if (!requestedService || (requestedService.testOnly && process.env.NODE_ENV === 'production' && !isTestBookingModeEnabled())) {
      return NextResponse.json({ error: 'Hoạt động thử nghiệm hiện không nhận đặt chỗ thực tế.' }, { status: 404 });
    }
    const requestedProvider = requestedService ? await db.getProviderById(requestedService.providerId) : null;
    if (requestedService.status !== 'PUBLISHED' || !requestedProvider?.active || !requestedService.slots.includes(body.slot)) {
      return NextResponse.json({ error: 'Dịch vụ chưa mở nhận yêu cầu hoặc khung giờ không hợp lệ.' }, { status: 409 });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date ||
      date < getTodayInVietnam()
    ) {
      return NextResponse.json({ error: 'Ngày trải nghiệm không hợp lệ hoặc đã qua.' }, { status: 400 });
    }
    if (!isBookableSlotInVietnam(date, body.slot)) {
      return NextResponse.json({ error: 'Vui lòng đặt trước giờ trải nghiệm ít nhất 30 phút.' }, { status: 400 });
    }
    if (customerName.length < 2 || customerName.length > 100) {
      return NextResponse.json({ error: 'Tên người liên hệ phải từ 2 đến 100 ký tự.' }, { status: 400 });
    }
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại hợp lệ.' }, { status: 400 });
    }
    if (typeof body.notes === 'string' && body.notes.length > 500) {
      return NextResponse.json({ error: 'Ghi chú không được vượt quá 500 ký tự.' }, { status: 400 });
    }

    const booking = await db.createBooking({
      serviceId: body.serviceId,
      customerId,
      customerName,
      customerPhone,
      notes: typeof body.notes === 'string' ? body.notes.trim() : undefined,
      date,
      slot: body.slot,
      people,
      source: body.source || 'Trực tiếp',
    });

    return NextResponse.json({
      success: true,
      booking,
      message: requestedService.testOnly
        ? 'Yêu cầu đặt chỗ thử nghiệm đã được ghi nhận; yêu cầu này chưa được gửi đến nhà vườn thật.'
        : 'Đặt lịch thành công! Nhà vườn sẽ sớm liên hệ xác nhận.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
