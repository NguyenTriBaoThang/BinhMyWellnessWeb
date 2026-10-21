import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db, isPersistentDatabaseConfigured } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isDatabaseConnectionError } from '@/lib/db-errors';

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production' && !isPersistentDatabaseConfigured()) {
      return NextResponse.json({ error: 'Website chưa được kết nối cơ sở dữ liệu tài khoản.' }, { status: 503 });
    }
    const body = await req.json() as Record<string, unknown>;
    const { email, password, name, phone } = body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 8
      || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email, họ tên và mật khẩu tối thiểu 8 ký tự.' },
        { status: 400 }
      );
    }

    const role = body.role ?? 'CUSTOMER';
    if (role !== 'CUSTOMER' && role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Vai trò đăng ký không hợp lệ.' }, { status: 400 });
    }

    if (role === 'PROVIDER') {
      const provider = body.provider as Record<string, unknown> | undefined;
      const providerName = typeof provider?.name === 'string' ? provider.name.trim() : '';
      const story = typeof provider?.story === 'string' ? provider.story.trim() : '';
      const contact = typeof provider?.contact === 'string' ? provider.contact.trim() : '';
      const address = typeof provider?.address === 'string' ? provider.address.trim() : '';
      if (!providerName || providerName.length < 2 || story.length < 20 || story.length > 3000
        || contact.length < 6 || contact.length > 100 || address.length < 5 || address.length > 200) {
        return NextResponse.json({ error: 'Hồ sơ cần tên nhà vườn, giới thiệu từ 20 ký tự, thông tin liên hệ và địa chỉ hợp lệ.' }, { status: 400 });
      }
      if (!isPersistentDatabaseConfigured()) {
        return NextResponse.json({ error: 'Đăng ký hồ sơ nhà vườn cần cơ sở dữ liệu PostgreSQL đã cấu hình.' }, { status: 503 });
      }

      const account = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: email.trim().toLowerCase(),
            password: hashPassword(password),
            name: name.trim(),
            phone: typeof phone === 'string' ? phone.trim() || null : null,
            role: 'PROVIDER',
            providerProfile: {
              create: {
                code: `BMV-${randomUUID().slice(0, 10).toUpperCase()}`,
                name: providerName,
                story,
                contact,
                address,
                active: false,
              },
            },
          },
          include: { providerProfile: true },
        });
        await tx.auditLog.create({
          data: {
            actor: created.name,
            action: 'Nộp hồ sơ nhà vườn',
            target: providerName,
            detail: 'Hồ sơ mới đang chờ quản trị viên kích hoạt.',
            userId: created.id,
          },
        });
        return created;
      });

      return NextResponse.json({
        success: true,
        user: {
          id: account.id,
          email: account.email,
          name: account.name,
          phone: account.phone ?? undefined,
          role: account.role,
          providerProfileId: account.providerProfile?.id,
        },
        message: 'Đã tạo hồ sơ nhà vườn. Đăng nhập để hoàn thiện dịch vụ; hồ sơ sẽ hiển thị sau khi được quản trị viên kích hoạt.',
      }, { status: 201 });
    }

    const user = await db.createUser({
      email: email.trim(),
      password,
      name: name.trim(),
      phone: typeof phone === 'string' ? phone : undefined,
      role: 'CUSTOMER',
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email này đã được đăng ký.' }, { status: 409 });
    }
    if (isDatabaseConnectionError(error)) {
      console.error('Account registration database connection failed.', { code: error?.code });
      return NextResponse.json(
        { error: 'Hệ thống tạm thời không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Lỗi khi đăng ký' },
      { status: 400 }
    );
  }
}
