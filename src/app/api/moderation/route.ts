import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Chỉ ban quản trị mới có quyền thực hiện kiểm duyệt.' },
        { status: 403 }
      );
    }

    const { type, id, status, note } = await req.json();

    if (type === 'service') {
      const service = await db.moderateService(id, status, note, user.name);
      return NextResponse.json({
        success: true,
        service,
        message: 'Đã cập nhật trạng thái kiểm duyệt dịch vụ thành công.',
      });
    } else if (type === 'provider') {
      const provider = await db.toggleProvider(id, user.name);
      return NextResponse.json({
        success: true,
        provider,
        message: `Đã ${provider.active ? 'kích hoạt' : 'tạm dừng'} cơ sở nhà vườn.`,
      });
    }

    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
