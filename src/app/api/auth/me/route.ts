import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { encodeSession, getCurrentUser } from '@/lib/auth';
import { db, isPersistentDatabaseConfigured } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { getTodayInVietnam } from '@/lib/utils';

const COOKIE_NAME = 'bm_session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  if (user.role !== 'PROVIDER') return NextResponse.json({ user });
  try {
    const provider = await db.getProviderByUserId(user.id);
    const availabilityCount = provider && isPersistentDatabaseConfigured()
      ? await prisma.serviceAvailability.count({ where: { service: { providerId: provider.id }, date: { gte: new Date(`${getTodayInVietnam()}T00:00:00.000Z`) }, status: 'AVAILABLE' } })
      : 0;
    return NextResponse.json({ user, provider, availabilityCount });
  } catch {
    return NextResponse.json({ user, provider: null, availabilityCount: 0 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'PROVIDER') return NextResponse.json({ error: 'Chỉ tài khoản nhà vườn mới được cập nhật hồ sơ.' }, { status: 403 });
    const body = await request.json() as Record<string, unknown>;
    const fields = {
      name: typeof body.name === 'string' ? body.name.trim() : '',
      story: typeof body.story === 'string' ? body.story.trim() : '',
      contact: typeof body.contact === 'string' ? body.contact.trim() : '',
      address: typeof body.address === 'string' ? body.address.trim() : '',
    };
    if (fields.name.length < 2 || fields.name.length > 100 || fields.story.length < 20 || fields.story.length > 3000
      || fields.contact.length < 6 || fields.contact.length > 100 || fields.address.length < 5 || fields.address.length > 200) {
      return NextResponse.json({ error: 'Kiểm tra tên, giới thiệu (20–3.000 ký tự), liên hệ và địa chỉ.' }, { status: 400 });
    }

    let provider = await db.getProviderByUserId(user.id);
    if (provider) {
      provider = await db.updateProvider(provider.id, fields, user.name);
    } else {
      if (!isPersistentDatabaseConfigured()) return NextResponse.json({ error: 'Tạo hồ sơ nhà vườn cần PostgreSQL đã cấu hình.' }, { status: 503 });
      const row = await prisma.$transaction(async (tx) => {
        const created = await tx.providerProfile.create({
          data: {
            code: `BMV-${randomUUID().slice(0, 10).toUpperCase()}`,
            userId: user.id,
            ...fields,
            active: false,
          },
        });
        await tx.auditLog.create({
          data: { actor: user.name, action: 'Tạo hồ sơ nhà vườn', target: created.name, detail: 'Hồ sơ đang chờ quản trị viên kích hoạt.', userId: user.id },
        });
        return created;
      });
      provider = { id: row.id, code: row.code, userId: row.userId, name: row.name, story: row.story, contact: row.contact, address: row.address, active: row.active };
    }

    const response = NextResponse.json({ success: true, provider, message: 'Đã lưu hồ sơ nhà vườn.' });
    response.cookies.set(COOKIE_NAME, encodeSession({ ...user, providerProfileId: provider.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'Tài khoản này đã có hồ sơ nhà vườn.' }, { status: 409 });
    return NextResponse.json({ error: 'Không thể lưu hồ sơ nhà vườn lúc này.' }, { status: 503 });
  }
}
