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

function columnNames(rows: unknown[]): Set<string> {
  return new Set(
    rows.map((row) => {
      const r = row as Record<string, unknown>;
      return String(r.name ?? "");
    }),
  );
}

/**
 * Repairs legacy `post_likes` schemas found in older production DBs.
 *
 * Some earlier deployments created `post_likes` with different columns
 * (e.g. slug/lang instead of post_id). `CREATE TABLE IF NOT EXISTS` won't
 * fix an existing table, so we rebuild it when needed.
 *
 * Best-effort migration:
 * - If legacy table has `slug`, `lang`, and `visitor_hash`, we map rows to
 *   `post_id` via posts+translations.
 * - Otherwise we rebuild the table and drop existing likes.
 */
export async function migratePostLikesTable(db: Client): Promise<void> {
  const info = await db.execute("PRAGMA table_info(post_likes)");
  if (info.rows.length === 0) return;

  const cols = columnNames(info.rows as unknown[]);
  if (cols.has("post_id") && cols.has("visitor_hash")) return;

  console.warn(
    `[db] legacy post_likes schema detected: ${Array.from(cols).join(",")}`,
  );

  const slugCol = cols.has("slug")
    ? "slug"
    : cols.has("post_slug")
      ? "post_slug"
      : null;
  const langCol = cols.has("lang")
    ? "lang"
    : cols.has("post_lang")
      ? "post_lang"
      : null;
  const visitorHashCol = cols.has("visitor_hash") ? "visitor_hash" : null;
  const createdAtCol = cols.has("created_at") ? "created_at" : null;
  const idCol = cols.has("id") ? "id" : null;

  await db.execute("BEGIN");
  try {
    await db.execute("DROP TABLE IF EXISTS post_likes__new");
    await db.execute(`
      CREATE TABLE post_likes__new (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        visitor_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE(post_id, visitor_hash)
      );
    `);

    if (slugCol && langCol && visitorHashCol) {
      const createdAtExpr = createdAtCol
        ? `COALESCE(pl.${createdAtCol}, CURRENT_TIMESTAMP)`
        : "CURRENT_TIMESTAMP";
      const idExpr = idCol
        ? `COALESCE(pl.${idCol}, lower(hex(randomblob(16))))`
        : "lower(hex(randomblob(16)))";

      // Map legacy likes to post_id via posts+translations.
      await db.execute(`
        INSERT OR IGNORE INTO post_likes__new (id, post_id, visitor_hash, created_at)
        SELECT
          ${idExpr} AS id,
          p.id AS post_id,
          pl.${visitorHashCol} AS visitor_hash,
          ${createdAtExpr} AS created_at
        FROM post_likes pl
        JOIN posts p ON p.slug = pl.${slugCol}
        JOIN post_translations t ON t.post_id = p.id AND t.lang = pl.${langCol}
        WHERE p.id IS NOT NULL;
      `);
    } else {
      console.warn(
        "[db] legacy post_likes schema cannot be migrated; rebuilding empty table",
      );
    }

    await db.execute("DROP TABLE post_likes");
    await db.execute("ALTER TABLE post_likes__new RENAME TO post_likes");
    await db.execute("COMMIT");
  } catch (e) {
    await db.execute("ROLLBACK");
    console.error("[db] post_likes migration failed", e);
    throw e;
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

  await migratePostLikesTable(db);

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
