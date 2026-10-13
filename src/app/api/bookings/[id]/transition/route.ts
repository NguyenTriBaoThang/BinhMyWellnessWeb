import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác.' },
        { status: 401 }
      );
    }

    const { action, extra } = await req.json();

    const booking = await db.transitionBooking(
      params.id,
      action,
      user.role,
      user.name,
      extra
    );

    return NextResponse.json({
      success: true,
      booking,
      message: 'Cập nhật trạng thái yêu cầu thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
