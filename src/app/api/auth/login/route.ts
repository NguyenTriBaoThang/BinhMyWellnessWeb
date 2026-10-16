import { NextResponse } from 'next/server';
import { db, isPersistentDatabaseConfigured, isTestBookingModeEnabled } from '@/lib/db';
import { verifyPassword, encodeSession, isSessionSecretConfigured } from '@/lib/auth';
import { DEFAULT_ACCOUNTS, DEFAULT_PASSWORD } from '@/lib/constants';
import { isDatabaseConnectionError } from '@/lib/db-errors';

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production' && !isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Website chưa được kết nối cơ sở dữ liệu tài khoản.' }, { status: 503 });
    }
    if (process.env.NODE_ENV === 'production' && !isSessionSecretConfigured()) {
      return NextResponse.json({ error: 'Website chưa được cấu hình SESSION_SECRET.' }, { status: 503 });
    }
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const demoAccount = DEFAULT_ACCOUNTS.find((account) => account.email.toLowerCase() === normalizedEmail);
    const approvedTestLogin = isTestBookingModeEnabled() && (
      (demoAccount?.role === 'CUSTOMER' && demoAccount.id === 'user-customer-1') ||
      (demoAccount?.role === 'PROVIDER' && (
        normalizedEmail === 'nhavuona@gmail.com' ||
        /^provider\.p(?:[2-9]|10)@binhmy\.test$/.test(normalizedEmail)
      ))
    );

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

    // Never accept the publicly documented demo password for sample accounts in production.
    // A provisioned admin can still sign in with a private password stored as a hash in the DB.
    if (
      process.env.NODE_ENV === 'production' &&
      demoAccount &&
      password === DEFAULT_PASSWORD &&
      !approvedTestLogin
    ) {
      return NextResponse.json(
        { error: 'Tài khoản mẫu chỉ dùng trong môi trường thử nghiệm.' },
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
    if (isDatabaseConnectionError(error)) {
      console.error('Login database connection failed.', { code: error?.code });
      return NextResponse.json(
        { error: 'Hệ thống tạm thời không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Lỗi xử lý đăng nhập' },
      { status: 500 }
    );
  }
}
