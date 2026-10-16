import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import ts from 'typescript';
import { PrismaClient } from '@prisma/client';

let prisma;

async function loadEnvironment() {
  let source;
  try {
    source = await readFile(new URL('../.env', import.meta.url), 'utf8');
  } catch {
    return;
  }
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;
    const value = match[2].replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
    process.env[match[1]] = value;
  }
}

async function loadSeedData() {
  const filePath = fileURLToPath(new URL('../src/lib/constants.ts', import.meta.url));
  const source = await readFile(filePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('exports', 'module', compiled)(module.exports, module);
  return module.exports;
}

async function main() {
  await loadEnvironment();
  if (!process.env.DATABASE_URL) {
    throw new Error('Chưa khai báo DATABASE_URL trong .env hoặc môi trường chạy.');
  }

  prisma = new PrismaClient();
  const { DEFAULT_ACCOUNTS, DEFAULT_PASSWORD, SEED_PROVIDERS, SEED_SERVICES } = await loadSeedData();
  const adminPassword = process.env.BM_ADMIN_PASSWORD?.trim();
  if (adminPassword && (adminPassword.length < 12 || adminPassword === DEFAULT_PASSWORD)) {
    throw new Error('BM_ADMIN_PASSWORD phải có ít nhất 12 ký tự và khác mật khẩu mẫu.');
  }
  const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  const adminPasswordHash = adminPassword ? bcrypt.hashSync(adminPassword, 10) : null;

  for (const account of DEFAULT_ACCOUNTS) {
    const accountPasswordHash = account.role === 'ADMIN' && adminPasswordHash
      ? adminPasswordHash
      : passwordHash;
    await prisma.user.upsert({
      where: { email: account.email.toLowerCase() },
      update: {
        name: account.name,
        phone: account.phone ?? null,
        role: account.role,
        password: accountPasswordHash,
      },
      create: {
        id: account.id,
        email: account.email.toLowerCase(),
        name: account.name,
        phone: account.phone ?? null,
        role: account.role,
        password: accountPasswordHash,
      },
    });
  }

  for (const provider of SEED_PROVIDERS) {
    await prisma.providerProfile.upsert({
      where: { code: provider.code },
      update: {
        userId: provider.userId,
        name: provider.name,
        story: provider.story,
        contact: provider.contact,
        address: provider.address,
        active: provider.active,
      },
      create: provider,
    });
  }

  for (const service of SEED_SERVICES) {
    const data = {
      providerId: service.providerId,
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      capacity: service.capacity,
      image: service.image,
      latitude: service.latitude ?? null,
      longitude: service.longitude ?? null,
      groups: service.groups,
      indoor: service.indoor,
      description: service.description,
      status: service.status,
      slots: service.slots,
      amenities: service.amenities,
      included: service.included ?? null,
      excluded: service.excluded ?? null,
      conditions: service.conditions ?? null,
      moderationNote: service.moderationNote ?? null,
      testOnly: service.testOnly ?? false,
      bookingUnit: service.bookingUnit ?? null,
    };
    await prisma.service.upsert({
      where: { code: service.code },
      update: data,
      create: { id: service.id, code: service.code, ...data },
    });
  }

  console.log(`Đã nạp ${DEFAULT_ACCOUNTS.length} tài khoản thử nghiệm, ${SEED_PROVIDERS.length} cơ sở và ${SEED_SERVICES.length} dịch vụ.`);
  console.log(adminPasswordHash
    ? 'Tài khoản quản trị được đặt mật khẩu riêng từ BM_ADMIN_PASSWORD.'
    : 'Tài khoản quản trị vẫn dùng mật khẩu mẫu; chỉ đăng nhập được ở môi trường phát triển.');
}

main()
  .catch((error) => {
    console.error('Không nạp được dữ liệu khởi tạo:', error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
