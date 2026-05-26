import type { Client } from "@libsql/client";
import { hashPassword } from "../../src/lib/auth.ts";

/** Default CMS admin for local/dev when no users exist yet. */
export const DEFAULT_ADMIN_USERNAME = "admin";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

export async function seedDefaultAdmin(db: Client): Promise<void> {
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [DEFAULT_ADMIN_USERNAME],
  });
  if (existing.rows.length > 0) return;

  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  await db.execute({
    sql: "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
    args: [crypto.randomUUID(), DEFAULT_ADMIN_USERNAME, passwordHash],
  });
}
