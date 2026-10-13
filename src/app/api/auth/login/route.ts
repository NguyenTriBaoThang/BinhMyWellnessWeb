import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, encodeSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu.' },
        { status: 400 }
      );
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    const { passwordHash, ...safeUser } = user;
    const token = encodeSession(safeUser);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Đăng nhập thành công!',
    });

    response.cookies.set('bm_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Lỗi xử lý đăng nhập' },
      { status: 500 }
    );
  }
}
