import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLikeCount,
  hashVisitorId,
  isValidPostKey,
  isValidVisitorId,
  recordLike,
  resetLikesTableCache,
} from "./likes.service";
import { getDbClient } from "./db";

vi.mock("./db", () => ({
  getDbClient: vi.fn(),
}));

function mockExecuteForLikes(executeMock: ReturnType<typeof vi.fn>) {
  executeMock.mockImplementation((arg: string | { sql: string }) => {
    const sql = typeof arg === "string" ? arg : arg.sql;
    if (sql.includes("CREATE TABLE") || sql.includes("CREATE INDEX")) {
      return Promise.resolve({ rows: [] });
    }
    if (sql.includes("COUNT(*)")) {
      return Promise.resolve({ rows: [{ c: 5 }] });
    }
    if (sql.includes("INSERT INTO post_likes")) {
      return Promise.resolve({ rows: [] });
    }
    return Promise.resolve({ rows: [] });
  });
}

describe("likes.service", () => {
  let executeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resetLikesTableCache();
    executeMock = vi.fn();
    vi.mocked(getDbClient).mockReturnValue({ execute: executeMock } as any);
    vi.clearAllMocks();
  });

  it("validates post keys as lang/slug", () => {
    expect(isValidPostKey("en/hello-world")).toBe(true);
    expect(isValidPostKey("es/mi-post-123")).toBe(true);
    expect(isValidPostKey("xx/hello")).toBe(false);
    expect(isValidPostKey("en/hello/world")).toBe(false);
    expect(isValidPostKey("")).toBe(false);
  });

  it("validates visitor UUID v4", () => {
    expect(
      isValidVisitorId("550e8400-e29b-41d4-a716-446655440000"),
    ).toBe(true);
    expect(isValidVisitorId("not-a-uuid")).toBe(false);
  });

  it("hashVisitorId returns 64 hex chars", () => {
    const h = hashVisitorId("550e8400-e29b-41d4-a716-446655440000");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it("getLikeCount returns numeric count", async () => {
    mockExecuteForLikes(executeMock);
    const n = await getLikeCount("en/foo");
    expect(n).toBe(5);
  });

  it("recordLike returns inserted true on success", async () => {
    mockExecuteForLikes(executeMock);
    const r = await recordLike("en/foo", "deadbeef");
    expect(r.inserted).toBe(true);
  });

  it("recordLike returns inserted false on unique constraint", async () => {
    executeMock.mockImplementation((arg: string | { sql: string }) => {
      const sql = typeof arg === "string" ? arg : arg.sql;
      if (sql.includes("CREATE TABLE") || sql.includes("CREATE INDEX")) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes("INSERT INTO post_likes")) {
        return Promise.reject(new Error("SQLITE_CONSTRAINT_UNIQUE"));
      }
      return Promise.resolve({ rows: [] });
    });
    const r = await recordLike("en/foo", "abc");
    expect(r.inserted).toBe(false);
  });
});
