import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Đã đăng xuất thành công.',
  });

  response.cookies.set('bm_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
