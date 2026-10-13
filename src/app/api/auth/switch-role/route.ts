import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encodeSession } from '@/lib/auth';
import { Role } from '@/types';

export async function POST(req: Request) {
  try {
    const { role } = await req.json();

    const emailMap: Record<Role, string> = {
      CUSTOMER: 'baothang@gmail.com',
      PROVIDER: 'nhavuona@gmail.com',
      ADMIN: 'binhmy@admin.com',
    };

    const targetEmail = emailMap[role as Role] || 'baothang@gmail.com';
    const user = await db.findUserByEmail(targetEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản tương ứng với vai trò này.' },
        { status: 404 }
      );
    }

    const { passwordHash, ...safeUser } = user;
    const token = encodeSession(safeUser);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Đã chuyển sang vai trò: ${safeUser.name} (${safeUser.role})`,
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
      { error: error?.message || 'Lỗi khi chuyển vai trò' },
      { status: 500 }
    );
  }
}
