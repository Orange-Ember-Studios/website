import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./db.ts", () => ({
  getDbClient: vi.fn(),
}));

vi.mock("../../migrations/run.ts", () => ({
  runDatabaseMigrations: vi.fn(),
}));

describe("ensureDatabaseSchema", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("skips migrations when TURSO_SKIP_MIGRATIONS is set", async () => {
    vi.stubEnv("TURSO_DATABASE_URL", "libsql://prod.example.com");
    vi.stubEnv("TURSO_SKIP_MIGRATIONS", "1");

    const { runDatabaseMigrations } = await import("../../migrations/run.ts");
    const { ensureDatabaseSchema } = await import("./db-migrations.ts");

    await ensureDatabaseSchema({
      TURSO_DATABASE_URL: "libsql://prod.example.com",
      TURSO_AUTH_TOKEN: "token",
    });

    expect(runDatabaseMigrations).not.toHaveBeenCalled();
  });
});
