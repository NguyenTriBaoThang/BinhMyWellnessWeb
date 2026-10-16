const DATABASE_CONNECTION_ERROR_CODES = new Set(['P1000', 'P1001', 'P1017', 'P2024']);

export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { code?: unknown; message?: unknown };
  if (typeof candidate.code === 'string' && DATABASE_CONNECTION_ERROR_CODES.has(candidate.code)) {
    return true;
  }

  return typeof candidate.message === 'string'
    && /can't reach database server|connection refused|connection pool timeout/i.test(candidate.message);
}
