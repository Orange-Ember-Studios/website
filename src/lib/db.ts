import { createClient } from '@libsql/client';

export function getDbClient() {
  const url = import.meta.env?.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env?.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Database credentials are not configured');
  }

  return createClient({ url, authToken });
}
