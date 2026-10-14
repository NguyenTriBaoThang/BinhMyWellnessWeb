import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Chỉ ban quản trị mới có quyền xem thống kê & nhật ký.' },
        { status: 403 }
      );
    }

    const summary = await db.getAnalyticsSummary();
    const logs = await db.getLogs();
    const users = await db.getAllUsers();
    const providers = await db.getAllProviders();

    return NextResponse.json({ summary, logs, users, providers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (
      body.type !== 'view' ||
      typeof body.target !== 'string' ||
      !body.target.startsWith('/') ||
      body.target.length > 200
    ) {
      return NextResponse.json({ success: false, error: 'Lượt xem không hợp lệ.' }, { status: 400 });
    }

    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 60) : 'Trực tiếp';
    db.trackEvent('view', body.target, source || 'Trực tiếp');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
