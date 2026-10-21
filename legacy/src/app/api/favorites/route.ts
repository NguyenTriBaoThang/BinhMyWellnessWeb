import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Vui lòng đăng nhập bằng tài khoản khách hàng.' }, { status: 401 });
  }

  return NextResponse.json({ favorites: await db.getFavorites(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Vui lòng đăng nhập bằng tài khoản khách hàng.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (typeof body.serviceId !== 'string' || typeof body.favorited !== 'boolean') {
      return NextResponse.json({ error: 'Yêu cầu lưu trải nghiệm không hợp lệ.' }, { status: 400 });
    }

    const service = await db.getServiceById(body.serviceId);
    const provider = service ? await db.getProviderById(service.providerId) : null;
    if (!service || service.status !== 'PUBLISHED' || !provider?.active) {
      return NextResponse.json({ error: 'Trải nghiệm này hiện không thể lưu.' }, { status: 404 });
    }

    await db.setFavorite(user.id, service.id, body.favorited);
    return NextResponse.json({ favorites: await db.getFavorites(user.id) });
  } catch {
    return NextResponse.json({ error: 'Không thể cập nhật danh sách yêu thích.' }, { status: 500 });
  }
}
