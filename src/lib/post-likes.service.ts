import { getDbClient, type TursoCredentials } from "./db.ts";
import type { Client } from "@libsql/client";

type PostLikeSummary = {
  count: number;
  liked: boolean;
};

type PostRecord = {
  id: string;
};

async function ensurePostLikesTable(db: Client) {
  try {
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
  } catch (e) {
    console.error("[post-likes] ensure table failed", e);
    throw e;
  }
}

async function getPublishedPostForLikes(
  db: Client,
  slug: string,
  lang: string,
): Promise<PostRecord | null> {
  let res: Awaited<ReturnType<Client["execute"]>>;
  try {
    res = await db.execute({
      sql: `
        SELECT p.id
        FROM posts p
        JOIN post_translations t ON p.id = t.post_id
        WHERE p.slug = ? AND t.lang = ? AND t.published = 1
        LIMIT 1
      `,
      args: [slug, lang],
    });
  } catch (e) {
    console.error(
      `[post-likes] resolve post failed slug=${slug} lang=${lang}`,
      e,
    );
    throw e;
  }

  if (res.rows.length === 0) return null;

  return {
    id: String(res.rows[0].id),
  };
}

async function hashVisitorForPost(postId: string, visitorId: string) {
  const data = new TextEncoder().encode(`${postId}:${visitorId}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getLikeSummary(
  db: Client,
  postId: string,
  visitorHash: string,
): Promise<PostLikeSummary> {
  let countRes: Awaited<ReturnType<Client["execute"]>>;
  let likedRes: Awaited<ReturnType<Client["execute"]>>;
  try {
    [countRes, likedRes] = await Promise.all([
      db.execute({
        sql: "SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?",
        args: [postId],
      }),
      db.execute({
        sql: "SELECT 1 FROM post_likes WHERE post_id = ? AND visitor_hash = ? LIMIT 1",
        args: [postId, visitorHash],
      }),
    ]);
  } catch (e) {
    console.error(
      `[post-likes] summary query failed postId=${postId}`,
      e,
    );
    throw e;
  }

  return {
    count: Number(countRes.rows[0]?.count ?? 0),
    liked: likedRes.rows.length > 0,
  };
}

export async function getPostLikeStatus(
  slug: string,
  lang: string,
  visitorId: string,
  creds?: TursoCredentials,
): Promise<PostLikeSummary | null> {
  let db: Client;
  try {
    db = getDbClient(creds);
  } catch (e) {
    console.error(
      `[post-likes] db client init failed slug=${slug} lang=${lang}`,
      e,
    );
    throw e;
  }
  await ensurePostLikesTable(db);

  const post = await getPublishedPostForLikes(db, slug, lang);
  if (!post) return null;

  const visitorHash = await hashVisitorForPost(post.id, visitorId);
  return getLikeSummary(db, post.id, visitorHash);
}

export async function likePost(
  slug: string,
  lang: string,
  visitorId: string,
  creds?: TursoCredentials,
): Promise<PostLikeSummary | null> {
  let db: Client;
  try {
    db = getDbClient(creds);
  } catch (e) {
    console.error(
      `[post-likes] db client init failed (like) slug=${slug} lang=${lang}`,
      e,
    );
    throw e;
  }
  await ensurePostLikesTable(db);

  const post = await getPublishedPostForLikes(db, slug, lang);
  if (!post) return null;

  const visitorHash = await hashVisitorForPost(post.id, visitorId);

  try {
    await db.execute({
      sql: "INSERT OR IGNORE INTO post_likes (id, post_id, visitor_hash) VALUES (?, ?, ?)",
      args: [crypto.randomUUID(), post.id, visitorHash],
    });
  } catch (e) {
    console.error(
      `[post-likes] insert failed postId=${post.id} slug=${slug} lang=${lang}`,
      e,
    );
    throw e;
  }

  return getLikeSummary(db, post.id, visitorHash);
}
