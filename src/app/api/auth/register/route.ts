import { NextResponse } from 'next/server';
import { db, isPersistentDatabaseConfigured } from '@/lib/db';

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production' && !isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Website chưa được kết nối cơ sở dữ liệu tài khoản.' }, { status: 503 });
    }
    const { email, password, name, phone } = await req.json();

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
      role: 'CUSTOMER',
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
