import { describe, expect, it, vi } from "vitest";
import type { Client } from "@libsql/client";
import { migratePostLikesTable } from "./db-migrations.ts";

function tableInfoRows(cols: string[]) {
  return cols.map((name) => ({ name }));
}

describe("migratePostLikesTable", () => {
  it("no-ops when post_likes already has post_id + visitor_hash", async () => {
    const execute = vi.fn(async (sql: any) => {
      if (sql === "PRAGMA table_info(post_likes)") {
        return { rows: tableInfoRows(["id", "post_id", "visitor_hash", "created_at"]) };
      }
      return { rows: [] };
    });

    const db = { execute } as unknown as Client;
    await migratePostLikesTable(db);

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("rebuilds legacy post_likes missing post_id", async () => {
    const calls: string[] = [];
    const execute = vi.fn(async (sql: any) => {
      const text = typeof sql === "string" ? sql : String(sql?.sql ?? "");
      calls.push(text);
      if (text === "PRAGMA table_info(post_likes)") {
        return { rows: tableInfoRows(["id", "slug", "lang", "visitor_hash", "created_at"]) };
      }
      return { rows: [] };
    });

    const db = { execute } as unknown as Client;
    await migratePostLikesTable(db);

    expect(calls[0]).toBe("PRAGMA table_info(post_likes)");
    expect(calls).toContain("BEGIN");
    expect(calls.some((c) => c.includes("CREATE TABLE post_likes__new"))).toBe(true);
    expect(calls.some((c) => c.includes("INSERT OR IGNORE INTO post_likes__new"))).toBe(true);
    expect(calls).toContain("DROP TABLE post_likes");
    expect(calls).toContain("ALTER TABLE post_likes__new RENAME TO post_likes");
    expect(calls).toContain("COMMIT");
  });
});

