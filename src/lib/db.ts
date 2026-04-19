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
    fetch: async (requestOrUrl: string | URL | Request | any, init?: RequestInit) => {
      // If the request is a Request object (likely from cross-fetch/node-fetch),
      // we extract the properties. Cloudflare edge fetch throws "Invalid URL: [object Request]" 
      // if it receives an alien Request object it didn't mint itself.
      if (typeof requestOrUrl === 'object' && 'url' in requestOrUrl) {
        const headers = new Headers();
        if (requestOrUrl.headers && typeof requestOrUrl.headers.forEach === 'function') {
          requestOrUrl.headers.forEach((value: string, key: string) => headers.set(key, value));
        }

        let body: ArrayBuffer | undefined = undefined;
        // Extract body safely as ArrayBuffer to avoid passing Node readable streams to Edge native fetch
        if (requestOrUrl.method !== 'GET' && requestOrUrl.method !== 'HEAD') {
          body = await requestOrUrl.clone().arrayBuffer();
        }

        return fetch(requestOrUrl.url, {
          method: requestOrUrl.method,
          headers,
          body,
        });
      }

      // @ts-ignore - Fallback for string/URL representations
      return fetch(requestOrUrl, init);
    }
  });
}
