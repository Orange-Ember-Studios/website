import { createHash, randomUUID } from "crypto";
import { getDbClient } from "./db";
import { EnvManager } from "./EnvManager";

const CREATE_LIKES_TABLE = `
  CREATE TABLE IF NOT EXISTS post_likes (
    id TEXT PRIMARY KEY,
    post_key TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_key, visitor_hash)
  );
`;

const POST_KEY_PATTERN = /^(en|es|fr)\/[a-z0-9-]+$/i;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let tableEnsured = false;

/** Clears in-memory DDL cache (for unit tests). */
export function resetLikesTableCache(): void {
  tableEnsured = false;
}

export function isValidPostKey(postKey: string): boolean {
  return POST_KEY_PATTERN.test(postKey.trim());
}

export function isValidVisitorId(visitorId: string): boolean {
  return UUID_RE.test(visitorId.trim());
}

export function hashVisitorId(visitorId: string): string {
  return createHash("sha256")
    .update(`${visitorId.trim()}:${EnvManager.JWT_SECRET}`)
    .digest("hex");
}

async function ensureTable() {
  if (tableEnsured) return;
  const db = getDbClient();
  await db.execute(CREATE_LIKES_TABLE);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_post_likes_post_key ON post_likes(post_key);`,
  );
  tableEnsured = true;
}

export async function getLikeCount(postKey: string): Promise<number> {
  await ensureTable();
  const db = getDbClient();
  const res = await db.execute({
    sql: `SELECT COUNT(*) AS c FROM post_likes WHERE post_key = ?`,
    args: [postKey],
  });
  const row = res.rows[0] as unknown as { c: number | bigint } | undefined;
  if (!row) return 0;
  const n = row.c;
  return typeof n === "bigint" ? Number(n) : Number(n);
}

export async function visitorHasLiked(
  postKey: string,
  visitorHash: string,
): Promise<boolean> {
  await ensureTable();
  const db = getDbClient();
  const res = await db.execute({
    sql: `SELECT 1 AS x FROM post_likes WHERE post_key = ? AND visitor_hash = ? LIMIT 1`,
    args: [postKey, visitorHash],
  });
  return res.rows.length > 0;
}

/**
 * Records a like for postKey from this visitor (hashed id).
 * Idempotent: duplicate requests do not increase the count.
 */
export async function recordLike(
  postKey: string,
  visitorHash: string,
): Promise<{ inserted: boolean }> {
  await ensureTable();
  const db = getDbClient();
  const id = randomUUID();
  try {
    await db.execute({
      sql: `INSERT INTO post_likes (id, post_key, visitor_hash) VALUES (?, ?, ?)`,
      args: [id, postKey, visitorHash],
    });
    return { inserted: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("UNIQUE") ||
      msg.includes("unique") ||
      msg.includes("constraint")
    ) {
      return { inserted: false };
    }
    throw e;
  }
}
