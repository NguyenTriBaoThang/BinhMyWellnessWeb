import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encodeSession } from '@/lib/auth';
import { Role } from '@/types';

export async function POST(req: Request) {
  try {
    const productionTestMode = process.env.NODE_ENV === 'production' && process.env.BM_ENABLE_TEST_BOOKINGS === 'true';
    if (process.env.NODE_ENV === 'production' && !productionTestMode) {
      return NextResponse.json({ error: 'Đăng nhập nhanh chỉ bật trong môi trường thử nghiệm.' }, { status: 404 });
    }

    const { role, providerEmail } = await req.json();
    if (!['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(role) || (productionTestMode && role === 'ADMIN')) {
      return NextResponse.json({ error: 'Vai trò không hợp lệ.' }, { status: 400 });
    }

    const emailMap: Record<Role, string> = {
      CUSTOMER: 'baothang@gmail.com',
      PROVIDER: 'nhavuona@gmail.com',
      ADMIN: 'binhmy@admin.com',
    };

    const targetEmail = role === 'PROVIDER' && typeof providerEmail === 'string'
      ? providerEmail
      : emailMap[role as Role];
    const isAllowedTestProvider = targetEmail.toLowerCase() === 'nhavuona@gmail.com'
      || /^provider\.p(?:[2-9]|10)@binhmy\.test$/i.test(targetEmail);
    if (productionTestMode && role === 'PROVIDER' && !isAllowedTestProvider) {
      return NextResponse.json({ error: 'Chỉ tài khoản nhà vườn thử nghiệm được dùng ở chế độ này.' }, { status: 403 });
    }
    const user = await db.findUserByEmail(targetEmail);

    if (!user || user.role !== role) {
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
      secure: false,
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
