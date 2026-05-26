import type { Client } from "@libsql/client";

/** Adds `author` / `image` when migrating older DBs created without those columns. */
export async function migratePostsAuthorImageColumns(db: Client): Promise<void> {
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
