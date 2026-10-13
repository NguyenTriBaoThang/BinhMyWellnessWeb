import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_ACCOUNTS = [
  {
    id: 'user-customer-1',
    email: 'baothang@gmail.com',
    name: 'Bảo Thắng',
    phone: '0901234567',
    role: 'CUSTOMER',
  },
  {
    id: 'user-provider-1',
    email: 'nhavuona@gmail.com',
    name: 'Chủ Vườn Xanh A',
    phone: '0908123456',
    role: 'PROVIDER',
  },
  {
    id: 'user-admin-1',
    email: 'binhmy@admin.com',
    name: 'Ban Quản Trị Bình Mỹ',
    phone: '0988888888',
    role: 'ADMIN',
  },
];

const SEED_PROVIDERS = [
  {
    id: 'p1',
    code: 'p1',
    userId: 'user-provider-1',
    name: 'Vườn xanh Bình Mỹ',
    story: 'Vườn xanh Bình Mỹ là mô hình nông trại sinh thái thực nghiệm tại Ấp 6 xã Bình Mỹ. Tại đây du khách được trải nghiệm tự tay thu hoạch rau củ hữu cơ, tìm hiểu phương pháp chăm sóc cây trồng tự nhiên và tận hưởng bầu không khí trong lành của miệt vườn Củ Chi ven sông Sài Gòn.',
    contact: '0908 123 456 · vuonxanh.binhmy@gmail.com',
    address: '185/2 Đường Hà Duy Phiên (Tỉnh lộ 9), Ấp 6, Xã Bình Mỹ, Huyện Củ Chi, TP.HCM',
    active: true,
  },
  {
    id: 'p2',
    code: 'p2',
    userId: 'user-customer-1', // fallback reference
    name: 'Khu ẩm thực Rạch Dứa',
    story: 'Tọa lạc ngay cạnh dòng Rạch Dứa tự nhiên nhiều bóng mát, Khu ẩm thực sinh thái Rạch Dứa mang đến trải nghiệm ẩm thực đồng quê Nam Bộ chuẩn vị: cá lóc nướng trui cuốn bánh tráng, gà thả vườn và lẩu miệt vườn đậm đà tình quê.',
    contact: '0932 789 123 · rachdua.binhmy@gmail.com',
    address: 'Khu vực Cầu Rạch Dứa, Đường Hà Duy Phiên (Tỉnh lộ 9), Ấp 4A, Xã Bình Mỹ, Huyện Củ Chi, TP.HCM',
    active: true,
  },
];

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu vào PostgreSQL...');

  const passwordHash = bcrypt.hashSync('password@123', 10);

  for (const acc of DEFAULT_ACCOUNTS) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        role: acc.role,
        password: passwordHash,
      },
      create: {
        id: acc.id,
        email: acc.email,
        password: passwordHash,
        name: acc.name,
        phone: acc.phone,
        role: acc.role,
      },
    });
    console.log(`✅ Đã tạo/cập nhật tài khoản: ${acc.email} (${acc.role})`);
  }

  for (const prov of SEED_PROVIDERS) {
    await prisma.providerProfile.upsert({
      where: { code: prov.code },
      update: {
        name: prov.name,
        story: prov.story,
        address: prov.address,
        contact: prov.contact,
        active: prov.active,
      },
      create: {
        id: prov.id,
        code: prov.code,
        userId: prov.userId,
        name: prov.name,
        story: prov.story,
        contact: prov.contact,
        address: prov.address,
        active: prov.active,
      },
    });
    console.log(`✅ Đã tạo/cập nhật nhà vườn: ${prov.name}`);
  }

  console.log('🎉 Hoàn tất nạp dữ liệu PostgreSQL thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
