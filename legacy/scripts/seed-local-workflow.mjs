import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.BM_LOCAL_WORKFLOW_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Set BM_LOCAL_WORKFLOW_DATABASE_URL to a local PostgreSQL URL before seeding.');
}

let parsedUrl;
try {
  parsedUrl = new URL(databaseUrl);
} catch {
  throw new Error('BM_LOCAL_WORKFLOW_DATABASE_URL is not a valid PostgreSQL URL.');
}

if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)
  || !['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname.toLowerCase())) {
  throw new Error('This seed only writes to PostgreSQL on localhost, 127.0.0.1, or ::1.');
}
if (process.env.NODE_ENV === 'production') {
  throw new Error('The local workflow seed cannot run with NODE_ENV=production.');
}

process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = databaseUrl;

const prisma = new PrismaClient();
const password = 'BinhMyLocal@2026!';
const passwordHash = bcrypt.hashSync(password, 10);
const slots = ['08:30', '10:30', '14:00'];

function getVietnamDateString(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateAfter(daysAhead) {
  const date = new Date(`${getVietnamDateString(new Date())}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

async function upsertLocalAccount(tx, email, name, role, phone) {
  const existing = await tx.user.findUnique({ where: { email } });
  if (existing && existing.role !== role) {
    throw new Error(`The reserved local workflow email ${email} is already used by another role.`);
  }

  return tx.user.upsert({
    where: { email },
    update: { name, phone, role, password: passwordHash },
    create: { email, name, phone, role, password: passwordHash },
  });
}

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const providerUser = await upsertLocalAccount(
      tx, 'vuon.workflow@example.test', 'Chủ nhà vườn Bình Mỹ', 'PROVIDER', '0900000111',
    );
    const customer = await upsertLocalAccount(
      tx, 'khach.workflow@example.test', 'Khách trải nghiệm Bình Mỹ', 'CUSTOMER', '0900000222',
    );
    const admin = await upsertLocalAccount(
      tx, 'quantri.workflow@example.test', 'Quản trị Bình Mỹ', 'ADMIN', '0900000333',
    );

    const provider = await tx.providerProfile.upsert({
      where: { code: 'LOCAL-WORKFLOW-PROVIDER' },
      update: {},
      create: {
        code: 'LOCAL-WORKFLOW-PROVIDER',
        userId: providerUser.id,
        name: 'Vườn trải nghiệm Bình Mỹ',
        story: 'Nhà vườn tổ chức hoạt động gieo hạt, chăm sóc luống rau và thu hoạch nông sản theo mùa cho gia đình, nhóm bạn.',
        contact: '0900 000 111',
        address: 'Khu vực xã Bình Mỹ, Củ Chi, TP. Hồ Chí Minh',
        active: false,
      },
    });

    const service = await tx.service.upsert({
      where: { code: 'LOCAL-WORKFLOW-SERVICE' },
      update: {},
      create: {
        code: 'LOCAL-WORKFLOW-SERVICE',
        providerId: provider.id,
        name: 'Gieo trồng và thu hoạch rau theo mùa',
        category: 'Nông nghiệp',
        price: 120000,
        priceBasis: 'PER_PERSON',
        childPrice: 60000,
        duration: 90,
        capacity: 12,
        image: '/assets/nong_trai_binh_my.jpg',
        latitude: 10.9685,
        longitude: 106.6342,
        areaCode: null,
        testOnly: false,
        groups: ['family', 'friends'],
        indoor: false,
        description: 'Tham quan luống rau, thử gieo hạt và thu hoạch nông sản theo mùa cùng người phụ trách nhà vườn.',
        status: 'REVIEW',
        slots,
        amenities: ['Khu vực nghỉ chân', 'Nước uống'],
        included: 'Hướng dẫn hoạt động và dụng cụ làm vườn.',
        excluded: 'Chi phí mua thêm nông sản ngoài phần trải nghiệm.',
        conditions: 'Lịch, vị trí và thông tin dịch vụ cần được quản trị viên xác minh trước khi mở nhận khách.',
      },
    });

    const dates = [dateAfter(2), dateAfter(3)];
    for (const date of dates) {
      for (const slot of slots) {
        await tx.serviceAvailability.upsert({
          where: { serviceId_date_slot: { serviceId: service.id, date: new Date(`${date}T00:00:00.000Z`), slot } },
          update: {},
          create: {
            serviceId: service.id,
            date: new Date(`${date}T00:00:00.000Z`),
            slot,
            capacity: 12,
            status: 'AVAILABLE',
            verifiedAt: null,
            sourceNote: 'Lịch do nhà vườn cung cấp; chờ quản trị viên xác minh.',
          },
        });
      }
    }

    return { provider, service, providerUser, customer, admin, dates };
  });

  console.log('Đã tạo dữ liệu nhà vườn trong PostgreSQL local. Hồ sơ và lịch đang chờ duyệt/xác minh.');
  console.log(`Nhà vườn: ${result.provider.name} (${result.provider.code})`);
  console.log(`Dịch vụ: ${result.service.name} (${result.service.code}), trạng thái ${result.service.status}`);
  console.log(`Ngày có lịch: ${result.dates.join(', ')}; mỗi ngày có ${slots.join(', ')}.`);
  console.log('Tài khoản local (mật khẩu giống nhau):');
  console.log(`  Nhà vườn: ${result.providerUser.email}`);
  console.log(`  Khách hàng: ${result.customer.email}`);
  console.log(`  Quản trị: ${result.admin.email}`);
  console.log(`  Mật khẩu: ${password}`);
}

main()
  .catch((error) => {
    console.error('Không tạo được dữ liệu workflow local:', error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
