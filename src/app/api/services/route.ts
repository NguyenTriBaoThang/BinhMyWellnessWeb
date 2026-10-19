import { NextResponse } from 'next/server';
import { db, isPersistentDatabaseConfigured } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production' && !isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Website chưa được kết nối cơ sở dữ liệu dịch vụ.' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const budget = searchParams.get('budget') ? Number(searchParams.get('budget')) : undefined;
    const duration = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined;
    const group = searchParams.get('group') || undefined;
    const indoor = searchParams.get('indoor') === 'true';
    const all = searchParams.get('all') === 'true';

    const currentUser = await getCurrentUser();

    // Providers only see their own unpublished services; admins can review all.
    if (all && (currentUser?.role === 'ADMIN' || currentUser?.role === 'PROVIDER')) {
      const allServices = await db.getAllServices({ category, budget, duration, group, indoor });
      if (currentUser.role === 'PROVIDER') {
        const provider = await db.getProviderByUserId(currentUser.id);
        if (!provider) return NextResponse.json({ error: 'Tài khoản chưa có hồ sơ nhà vườn.' }, { status: 409 });
        return NextResponse.json({ services: allServices.filter((service) => service.providerId === provider.id) });
      }
      const services = allServices;
      return NextResponse.json({ services });
    }

    const services = await db.getPublicServices({ category, budget, duration, group, indoor });
    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Chỉ chủ nhà vườn hoặc quản trị viên mới có quyền tạo dịch vụ.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    let providerId = typeof body.providerId === 'string' ? body.providerId : '';
    if (user.role === 'PROVIDER') {
      const provider = await db.getProviderByUserId(user.id);
      if (!provider) return NextResponse.json({ error: 'Tạo dịch vụ cần hoàn tất hồ sơ nhà vườn trước.' }, { status: 409 });
      providerId = provider.id;
    } else if (!providerId) {
      providerId = 'p1';
    }
    const owner = await db.getProviderById(providerId);
    if (!owner) return NextResponse.json({ error: 'Không tìm thấy hồ sơ nhà vườn của dịch vụ.' }, { status: 400 });

    const service = await db.createService(
      {
        providerId,
        providerName: owner.name,
        name: body.name,
        category: body.category || 'Nông nghiệp',
        price: Number(body.price) || 100000,
        duration: Number(body.duration) || 60,
        capacity: Number(body.capacity) || 16,
        image: body.image || '/assets/nong_trai_binh_my.jpg',
        latitude: Number.isFinite(body.latitude) ? body.latitude : 10.98,
        longitude: Number.isFinite(body.longitude) ? body.longitude : 106.6,
        groups: body.groups || ['family', 'friends'],
        indoor: !!body.indoor,
        description: body.description || '',
        status: 'REVIEW',
        slots: body.slots || ['08:30', '10:30', '14:00', '16:00'],
        amenities: body.amenities || ['Có khu vực che mát', 'Điểm nghỉ chân'],
        included: body.included,
        excluded: body.excluded,
        conditions: body.conditions,
      },
      user.name
    );

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
