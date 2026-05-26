import type { Client } from "@libsql/client";

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
