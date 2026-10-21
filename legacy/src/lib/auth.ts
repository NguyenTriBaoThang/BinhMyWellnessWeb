import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { User, Role } from '@/types';
import { DEFAULT_ACCOUNTS, DEFAULT_PASSWORD } from './constants';

const COOKIE_NAME = 'bm_session';
const LOCAL_SESSION_SECRET = 'local-development-session-key-only';

export function isSessionSecretConfigured(): boolean {
  return (process.env.SESSION_SECRET?.length ?? 0) >= 32;
}

function getSessionSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    if (!isSessionSecretConfigured()) throw new Error('SESSION_SECRET must be set to at least 32 characters in production.');
    return process.env.SESSION_SECRET!;
  }
  return process.env.SESSION_SECRET || LOCAL_SESSION_SECRET;
}

function signSessionPayload(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (password === hash) return true; // fallback for unhashed dev seeds if needed
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return password === hash;
  }
}

export interface SessionData {
  user: User;
  token: string;
}

export function encodeSession(user: User): string {
  const payload = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${signSessionPayload(encodedPayload)}`;
}

export function decodeSession(token: string): User | null {
  try {
    const [encodedPayload, signature, extra] = token.split('.');
    if (extra !== undefined) return null;
    if (!signature) {
      // Older local demo cookies were unsigned; never accept them in production.
      if (process.env.NODE_ENV === 'production') return null;
    } else {
      const expectedSignature = Buffer.from(signSessionPayload(encodedPayload));
      const receivedSignature = Buffer.from(signature);
      if (expectedSignature.length !== receivedSignature.length || !timingSafeEqual(expectedSignature, receivedSignature)) return null;
    }
    const json = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const data = JSON.parse(json);
    if (data.exp && data.exp < Date.now()) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      avatar: data.avatar,
      providerProfileId: data.providerProfileId,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return decodeSession(token);
  } catch {
    return null;
  }
}

export function getDefaultAccountByEmail(email: string): User | undefined {
  return DEFAULT_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === email.toLowerCase()
  );
}

export function getDefaultAccountByRole(role: Role): User | undefined {
  return DEFAULT_ACCOUNTS.find((acc) => acc.role === role);
}
