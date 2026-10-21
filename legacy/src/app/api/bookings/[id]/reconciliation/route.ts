import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !['PROVIDER', 'ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Chỉ nhà vườn hoặc quản trị viên được đối soát.' }, { status: 403 });
    if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Đối soát cần cơ sở dữ liệu đã cấu hình.' }, { status: 503 });
    const booking = await prisma.booking.findFirst({ where: { OR: [{ id: params.id }, { code: params.id }] }, include: { provider: true } });
    if (!booking) return NextResponse.json({ error: 'Không tìm thấy đơn đặt chỗ.' }, { status: 404 });
    if (user.role === 'PROVIDER' && booking.provider.userId !== user.id) return NextResponse.json({ error: 'Đơn này không thuộc nhà vườn của bạn.' }, { status: 403 });
    const body = await request.json() as Record<string, unknown>;

    if (body.action === 'record') {
      if (booking.status !== 'COMPLETED') return NextResponse.json({ error: 'Chỉ đối soát đơn đã hoàn thành.' }, { status: 409 });
      const netReceivedVnd = body.netReceivedVnd;
      if (!Number.isSafeInteger(netReceivedVnd) || Number(netReceivedVnd) < 0 || Number(netReceivedVnd) > 1_000_000_000) {
        return NextResponse.json({ error: 'Khoản thu ròng phải là số nguyên từ 0 đến 1 tỷ đồng.' }, { status: 400 });
      }
      const fee = Math.round(Number(netReceivedVnd) * 0.08);
      const row = await prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({
          where: { id: booking.id },
          data: {
            netReceivedVnd: Number(netReceivedVnd),
            platformFeeVnd: fee,
            feeRecordedAt: new Date(),
            feePaidAt: booking.platformFeeVnd === fee && booking.netReceivedVnd === Number(netReceivedVnd) ? booking.feePaidAt : null,
          },
        });
        await tx.auditLog.create({ data: { actor: user.name, action: 'Ghi nhận đối soát 8%', target: booking.code, detail: `Khoản thu ròng ${netReceivedVnd} VND; phí nền tảng ${fee} VND.`, userId: user.id } });
        return updated;
      });
      return NextResponse.json({ success: true, reconciliation: row, feeRate: 0.08 });
    }

    if (body.action === 'mark_paid') {
      if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Chỉ quản trị viên xác nhận đã nhận phí.' }, { status: 403 });
      if (booking.status !== 'COMPLETED' || booking.platformFeeVnd === null || booking.feeRecordedAt === null) {
        return NextResponse.json({ error: 'Đơn chưa có khoản phí được đối soát.' }, { status: 409 });
      }
      const paidAt = booking.feePaidAt ?? new Date();
      const row = await prisma.$transaction(async (tx) => {
        const updated = await tx.booking.update({ where: { id: booking.id }, data: { feePaidAt: paidAt } });
        if (!booking.feePaidAt) await tx.auditLog.create({ data: { actor: user.name, action: 'Xác nhận đã nhận phí nền tảng', target: booking.code, detail: `Đã ghi nhận phí ${booking.platformFeeVnd} VND.`, userId: user.id } });
        return updated;
      });
      return NextResponse.json({ success: true, reconciliation: row });
    }
    return NextResponse.json({ error: 'Thao tác đối soát không hợp lệ.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Không thể cập nhật đối soát lúc này.' }, { status: 503 });
  }
}
