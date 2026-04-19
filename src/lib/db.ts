import { createClient } from '@libsql/client';
import { EnvManager } from './EnvManager';

export function getDbClient() {
  const url = EnvManager.TURSO_DATABASE_URL;
  const authToken = EnvManager.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Database credentials are not configured');
  }

  return createClient({ url, authToken });
}
