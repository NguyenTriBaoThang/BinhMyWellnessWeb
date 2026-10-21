import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await db.getServiceById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: 'Không tìm thấy dịch vụ.' },
        { status: 404 }
      );
    }

    const provider = await db.getProviderById(service.providerId);
    if (service.status !== 'PUBLISHED' || !provider?.active) {
      const user = await getCurrentUser();
      const owner = user?.role === 'PROVIDER' ? await db.getProviderByUserId(user.id) : null;
      if (user?.role !== 'ADMIN' && (!owner || owner.id !== service.providerId)) {
        return NextResponse.json({ error: 'Không tìm thấy dịch vụ.' }, { status: 404 });
      }
    }
    const reviews = await db.getReviews(service.id);

    return NextResponse.json({ service, provider, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Không có quyền chỉnh sửa dịch vụ.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const existing = await db.getServiceById(params.id);
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy dịch vụ.' }, { status: 404 });
    if (user.role === 'PROVIDER') {
      const provider = await db.getProviderByUserId(user.id);
      if (!provider || existing.providerId !== provider.id) {
        return NextResponse.json({ error: 'Dịch vụ này không thuộc hồ sơ nhà vườn của bạn.' }, { status: 403 });
      }
    }
    const service = await db.updateService(params.id, body, user.name);

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
