import 'server-only';
import { createHmac } from 'node:crypto';
import { prisma } from '@/lib/prisma';

let cleanupCounter = 0;

function makeKey(value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('SESSION_SECRET is required for AI request protection.');
  }
  return createHmac('sha256', secret || 'local-development-rate-limit-key')
    .update(value)
    .digest('hex');
}

async function consume(key: string, limit: number, now: Date): Promise<boolean> {
  const expiresAt = new Date(now.getTime() + 60_000);
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "ai_rate_limits" ("key", "count", "windowStartedAt", "expiresAt", "updatedAt")
    VALUES (${key}, 1, ${now}, ${expiresAt}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "ai_rate_limits"."expiresAt" <= ${now}
        THEN 1 ELSE "ai_rate_limits"."count" + 1 END,
      "windowStartedAt" = CASE WHEN "ai_rate_limits"."expiresAt" <= ${now}
        THEN ${now} ELSE "ai_rate_limits"."windowStartedAt" END,
      "expiresAt" = CASE WHEN "ai_rate_limits"."expiresAt" <= ${now}
        THEN ${expiresAt} ELSE "ai_rate_limits"."expiresAt" END,
      "updatedAt" = ${now}
    RETURNING "count"
  `;
  return (rows[0]?.count ?? limit + 1) <= limit;
}

export async function consumeAiRateLimit(request: Request, userId?: string): Promise<boolean> {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = request.headers.get('x-real-ip')?.trim() || forwarded || 'unknown-client';
  const now = new Date();
  const keys = [{ value: `ip:${ip}`, limit: userId ? 20 : 5 }];
  if (userId) keys.push({ value: `user:${userId}`, limit: 10 });

  let allowed = true;
  for (const item of keys) {
    if (!await consume(makeKey(item.value), item.limit, now)) allowed = false;
  }

  cleanupCounter += 1;
  if (cleanupCounter >= 100) {
    cleanupCounter = 0;
    await prisma.aiRateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  }
  return allowed;
}
