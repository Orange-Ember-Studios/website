import type { Client } from "@libsql/client";
import { hashPassword } from "./auth.ts";
import { getDbClient, type TursoCredentials } from "./db.ts";

const schemaReady = new Map<string, Promise<void>>();

function cacheKey(creds: TursoCredentials): string {
  const url = creds.TURSO_DATABASE_URL ?? "";
  const token = creds.TURSO_AUTH_TOKEN ?? "";
  return url.startsWith("file:") ? url : `${url}\0${token}`;
}

/** Adds `author` / `image` when migrating older DBs created without those columns. */
async function migratePostsAuthorImageColumns(db: Client): Promise<void> {
  const { rows } = await db.execute("PRAGMA table_info(posts)");
  const existing = new Set(
    rows.map((row) => {
      const r = row as Record<string, unknown>;
      return String(r.name ?? "");
    }),
  );
  if (!existing.has("author")) {
    await db.execute("ALTER TABLE posts ADD COLUMN author TEXT");
  }
  if (!existing.has("image")) {
    await db.execute("ALTER TABLE posts ADD COLUMN image TEXT");
  }
}

/**
 * Runs CREATE TABLE IF NOT EXISTS migrations and default admin seed once per
 * process for each distinct DB URL (cached). Safe to call from every API request.
 * No-ops when `TURSO_DATABASE_URL` is missing (e.g. contact-only API without DB).
 */
export async function ensureDatabaseSchema(
  creds: TursoCredentials,
): Promise<void> {
  const url = creds.TURSO_DATABASE_URL?.trim() ?? "";
  if (!url) return;

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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      author TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await migratePostsAuthorImageColumns(db);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS post_translations (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published BOOLEAN DEFAULT FALSE,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      UNIQUE(post_id, lang)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      visitor_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      UNIQUE(post_id, visitor_hash)
    );
  `);

  const adminRes = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: ["admin"],
  });
  if (adminRes.rows.length === 0) {
    const hash = await hashPassword("admin123");
    await db.execute({
      sql: "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
      args: [crypto.randomUUID(), "admin", hash],
    });
  }
}
