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

    // If admin or provider asking for all
    if (all && (currentUser?.role === 'ADMIN' || currentUser?.role === 'PROVIDER')) {
      const services = await db.getAllServices({ category, budget, duration, group, indoor });
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
    const service = await db.createService(
      {
        providerId: user.providerProfileId || 'p1',
        providerName: user.name,
        name: body.name,
        category: body.category || 'Nông nghiệp',
        price: Number(body.price) || 100000,
        duration: Number(body.duration) || 60,
        capacity: Number(body.capacity) || 16,
        image: body.image || '/assets/nong_trai_binh_my.jpg',
        latitude: body.latitude || 10.96,
        longitude: body.longitude || 106.64,
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
