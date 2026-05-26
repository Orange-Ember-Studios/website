import { getDbClient, type TursoCredentials } from "./db.ts";
import { runDatabaseMigrations } from "../../migrations/run.ts";

const schemaReady = new Map<string, Promise<void>>();

function cacheKey(creds: TursoCredentials): string {
  const url = creds.TURSO_DATABASE_URL ?? "";
  const token = creds.TURSO_AUTH_TOKEN ?? "";
  return url.startsWith("file:") ? url : `${url}\0${token}`;
}

/**
 * Runs SQL migrations, legacy patches, and init seeds once per process for each
 * distinct DB URL (cached). Safe to call from every API request.
 * No-ops when `TURSO_DATABASE_URL` is missing (e.g. contact-only API without DB).
 */
function skipMigrations(): boolean {
  const flag = process.env.TURSO_SKIP_MIGRATIONS?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export async function ensureDatabaseSchema(
  creds: TursoCredentials,
): Promise<void> {
  const url = creds.TURSO_DATABASE_URL?.trim() ?? "";
  if (!url) return;
  if (skipMigrations()) return;

  const key = cacheKey(creds);
  let pending = schemaReady.get(key);
  if (!pending) {
    pending = runMigrationsOnce(creds).catch((err) => {
      schemaReady.delete(key);
      throw err;
    });
    schemaReady.set(key, pending);
  }
  await pending;
}

async function runMigrationsOnce(creds: TursoCredentials): Promise<void> {
  const db = getDbClient(creds);
  await runDatabaseMigrations(db);
}