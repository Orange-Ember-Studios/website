import type { Client } from "@libsql/client";
import { seedDefaultAdmin } from "./init/default-admin.ts";
import { migratePostLikesTable } from "./patches/post-likes-legacy.ts";
import { migratePostsAuthorImageColumns } from "./patches/posts-author-image.ts";
import { schemaMigrations } from "./sql/index.ts";

export async function runDatabaseMigrations(db: Client): Promise<void> {
  const byId = Object.fromEntries(schemaMigrations.map((m) => [m.id, m.sql]));

  await db.execute(byId["001_users"]!);
  await db.execute(byId["002_posts"]!);
  await migratePostsAuthorImageColumns(db);
  await db.execute(byId["003_post_translations"]!);
  await migratePostLikesTable(db);
  await db.execute(byId["004_post_likes"]!);
  await seedDefaultAdmin(db);
}
