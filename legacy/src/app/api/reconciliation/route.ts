import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !['PROVIDER', 'ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Không có quyền xem đối soát.' }, { status: 403 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Đối soát cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const provider = user.role === 'PROVIDER' ? await prisma.providerProfile.findUnique({ where: { userId: user.id }, select: { id: true } }) : null;
    if (user.role === 'PROVIDER' && !provider) return NextResponse.json({ error: 'Không tìm thấy hồ sơ nhà vườn.' }, { status: 404 });
    const scope = provider ? { providerId: provider.id } : {};
    const [bookings, recorded, unpaid, unrecordedCount] = await Promise.all([
      prisma.booking.findMany({
        where: { status: 'COMPLETED', ...scope },
        include: { service: { select: { name: true } }, provider: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 200,
      }),
      prisma.booking.aggregate({ where: { status: 'COMPLETED', feeRecordedAt: { not: null }, ...scope }, _sum: { netReceivedVnd: true, platformFeeVnd: true } }),
      prisma.booking.aggregate({ where: { status: 'COMPLETED', feeRecordedAt: { not: null }, feePaidAt: null, ...scope }, _sum: { platformFeeVnd: true } }),
      prisma.booking.count({ where: { status: 'COMPLETED', feeRecordedAt: null, ...scope } }),
    ]);
    const totals = {
      netReceivedVnd: recorded._sum.netReceivedVnd ?? 0,
      feeRecordedVnd: recorded._sum.platformFeeVnd ?? 0,
      feeUnpaidVnd: unpaid._sum.platformFeeVnd ?? 0,
      unrecordedCount,
    };
    return NextResponse.json({ bookings, totals });
  } catch {
    return NextResponse.json({ error: 'Không thể tải đối soát lúc này.' }, { status: 503 });
  }
}
