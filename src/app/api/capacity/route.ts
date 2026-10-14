import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTodayInVietnam, isBookableSlotInVietnam } from '@/lib/utils';

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const requestedDate = searchParams.get('date') || getTodayInVietnam();
  const parsedDate = new Date(`${requestedDate}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== requestedDate
  ) {
    return NextResponse.json({ error: 'Ngày không hợp lệ.' }, { status: 400 });
  }

  try {
    const serviceId = searchParams.get('serviceId');
    const slot = searchParams.get('slot');
    if (serviceId || slot) {
      if (!serviceId || !slot) {
        return NextResponse.json({ error: 'Chọn dịch vụ và khung giờ để xem chỗ trống.' }, { status: 400 });
      }

      const service = await db.getServiceById(serviceId);
      const provider = service ? await db.getProviderById(service.providerId) : null;
      if (!service || service.status !== 'PUBLISHED' || !provider?.active || !service.slots.includes(slot)) {
        return NextResponse.json({ error: 'Khung giờ này hiện không khả dụng.' }, { status: 404 });
      }
      if (!isBookableSlotInVietnam(requestedDate, slot)) {
        return NextResponse.json({ error: 'Vui lòng đặt trước giờ trải nghiệm ít nhất 30 phút.' }, { status: 409 });
      }

      return NextResponse.json(
        {
          date: requestedDate,
          serviceId,
          slot,
          capacity: service.capacity,
          availablePlaces: db.getRemainingCapacity(serviceId, requestedDate, slot),
          updatedAt: new Date().toISOString(),
        },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const capacity = await db.getCapacitySummary(requestedDate);
    return NextResponse.json(
      { date: requestedDate, updatedAt: new Date().toISOString(), ...capacity },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ error: 'Không tải được tình trạng chỗ trống.' }, { status: 500 });
  }
}
