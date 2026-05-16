/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleApiRequest } from "./api-router.ts";
import type { SiteEnv } from "./site-env.ts";

vi.mock("../lib/db-migrations.ts", () => ({
  ensureDatabaseSchema: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/posts.service.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/posts.service.ts")>();
  return {
    ...actual,
    getPublishedPostsByType: vi.fn(),
    getAllPosts: vi.fn(),
  };
});

import { getPublishedPostsByType, getAllPosts } from "../lib/posts.service.ts";

const env: SiteEnv = {
  ASSETS: null as unknown as Fetcher,
  TURSO_DATABASE_URL: "http://local",
  TURSO_AUTH_TOKEN: "token",
  JWT_SECRET: "test-secret",
  TURNSTILE_SECRET_KEY: "",
  RESEND_API_KEY: "",
};

describe("GET /api/portfolio/projects", () => {
  beforeEach(() => {
    vi.mocked(getPublishedPostsByType).mockReset();
    vi.mocked(getAllPosts).mockReset();
  });

  it("returns 200 JSON without admin_token", async () => {
    vi.mocked(getPublishedPostsByType).mockResolvedValue([
      {
        id: "demo",
        data: {
          title: "Demo",
          meta: {
            category: "Game",
            status: "Live",
            description: "Hello",
            link: "",
          },
        },
      },
    ] as never);

    const res = await handleApiRequest(
      new Request("http://localhost/api/portfolio/projects?lang=en"),
      env,
    );

    expect(res.status).toBe(200);
    expect(getPublishedPostsByType).toHaveBeenCalledWith("project", expect.anything());
    const body = (await res.json()) as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("Demo");
  });
});

describe("GET /api/admin/posts", () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReset();
  });

  it("returns 401 without admin_token", async () => {
    const res = await handleApiRequest(
      new Request("http://localhost/api/admin/posts"),
      env,
    );
    expect(res.status).toBe(401);
    expect(getAllPosts).not.toHaveBeenCalled();
  });

  it("passes type query param to getAllPosts when authenticated", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([
      { id: "1", slug: "game", type: "project" },
    ] as never);

    const { createToken } = await import("../lib/auth.ts");
    const token = await createToken(
      { userId: "u1", username: "admin" },
      env.JWT_SECRET,
    );

    const res = await handleApiRequest(
      new Request("http://localhost/api/admin/posts?type=project", {
        headers: { cookie: `admin_token=${token}` },
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(getAllPosts).toHaveBeenCalledWith(
      expect.objectContaining({ TURSO_DATABASE_URL: "http://local" }),
      { type: "project" },
    );
  });
});
