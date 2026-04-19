import { createClient } from '@libsql/client/web';
import { EnvManager } from './EnvManager';

export function getDbClient() {
  const url = EnvManager.TURSO_DATABASE_URL;
  const authToken = EnvManager.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Database credentials are not configured');
  }

  return createClient({
    url,
    authToken,
    // Explicitly bypass @libsql's internal node-fetch polyfill by passing the global fetch
    fetch: (requestUrl: string | URL | Request, init?: RequestInit) => {
      // @ts-ignore - The types might conflict slightly across environments, but actual fetch call is standard
      return fetch(requestUrl, init);
    }
  });
}
