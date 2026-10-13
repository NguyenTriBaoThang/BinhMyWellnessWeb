import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ email, họ tên và mật khẩu.' },
        { status: 400 }
      );
    }

    const user = await db.createUser({
      email,
      password,
      name,
      phone,
      role: role || 'CUSTOMER',
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Lỗi khi đăng ký' },
      { status: 400 }
    );
  }
}
