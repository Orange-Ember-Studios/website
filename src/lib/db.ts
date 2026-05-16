import { createClient, type Client } from "@libsql/client";
import { EnvManager } from "./EnvManager.ts";

export type TursoCredentials = {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
};

function isFileUrl(url: string): boolean {
  return url.startsWith("file:");
}

export function getDbClient(creds?: TursoCredentials): Client {
  const url = creds?.TURSO_DATABASE_URL ?? EnvManager.TURSO_DATABASE_URL;
  const authToken = creds?.TURSO_AUTH_TOKEN ?? EnvManager.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("Database credentials are not configured");
  }

  // Local SQLite: use the Node client (package `"."` resolves to node.js here).
  // `@libsql/client/web` does not support `file:` URLs.
  if (isFileUrl(url)) {
    return createClient({ url });
  }

  if (!authToken) {
    throw new Error("Database credentials are not configured");
  }

  return { url, authToken };
}

export function getDbClient() {
  const { url, authToken } = getTursoCredentials();

  return createClient({
    url,
    authToken,
  });
}
