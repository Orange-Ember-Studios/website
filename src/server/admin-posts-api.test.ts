/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/db-migrations.ts", () => ({
  ensureDatabaseSchema: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/posts.service.ts", () => ({
  getAllPosts: vi.fn(),
  getPostById: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

import {
  handleAdminPostsCollection,
  handleAdminPostItem,
} from "./admin-posts-api.ts";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../lib/posts.service.ts";
import { createToken } from "../lib/auth.ts";
import type { SiteEnv } from "./site-env.ts";

const env: SiteEnv = {
  ASSETS: null as unknown as Fetcher,
  TURSO_DATABASE_URL: "http://local",
  TURSO_AUTH_TOKEN: "token",
  JWT_SECRET: "test-secret",
  TURNSTILE_SECRET_KEY: "",
  RESEND_API_KEY: "",
};

async function adminToken() {
  return await createToken({ userId: "u1", username: "admin" }, env.JWT_SECRET);
}

function req(url: string, init: RequestInit & { token?: string } = {}) {
  const { token, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (token) headers.set("cookie", `admin_token=${token}`);
  return new Request(url, { ...rest, headers });
}

describe("admin posts collection", () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReset();
    vi.mocked(createPost).mockReset();
  });

  it("rejects requests without an admin cookie", async () => {
    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts"),
      env,
    );
    expect(res.status).toBe(401);
    expect(getAllPosts).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", async () => {
    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts", { token: "not-a-jwt" }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns the posts of the requested type", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([
      { id: "1", slug: "game", type: "project" },
    ] as never);

    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts?type=project", { token: await adminToken() }),
      env,
    );

    expect(res.status).toBe(200);
    expect(getAllPosts).toHaveBeenCalledWith(
      { TURSO_DATABASE_URL: "http://local", TURSO_AUTH_TOKEN: "token" },
      { type: "project" },
    );
    await expect(res.json()).resolves.toEqual([
      { id: "1", slug: "game", type: "project" },
    ]);
  });

  it("returns every post when no type filter is given", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([] as never);

    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts", { token: await adminToken() }),
      env,
    );

    expect(res.status).toBe(200);
    expect(getAllPosts).toHaveBeenCalledWith(expect.anything(), undefined);
  });

  it("creates a post", async () => {
    vi.mocked(createPost).mockResolvedValue({ id: "new-id" } as never);

    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts", {
        method: "POST",
        token: await adminToken(),
        body: JSON.stringify({
          slug: "hello",
          type: "blog",
          author: "Jose",
          translations: [
            { lang: "en", title: "Hi", content: "{}", published: true },
          ],
        }),
      }),
      env,
    );

    expect(res.status).toBe(201);
    expect(createPost).toHaveBeenCalled();
  });

  it("validates the create payload", async () => {
    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts", {
        method: "POST",
        token: await adminToken(),
        body: JSON.stringify({ slug: "hello" }),
      }),
      env,
    );

    expect(res.status).toBe(400);
    expect(createPost).not.toHaveBeenCalled();
  });

  it("rejects unsupported methods", async () => {
    const res = await handleAdminPostsCollection(
      req("http://x/api/admin/posts", {
        method: "PATCH",
        token: await adminToken(),
      }),
      env,
    );
    expect(res.status).toBe(405);
  });
});

describe("admin post item", () => {
  beforeEach(() => {
    vi.mocked(getPostById).mockReset();
    vi.mocked(updatePost).mockReset();
    vi.mocked(deletePost).mockReset();
  });

  it("requires authentication", async () => {
    const res = await handleAdminPostItem(
      req("http://x/api/admin/posts/1"),
      env,
      "1",
    );
    expect(res.status).toBe(401);
  });

  it("returns a single post with translations", async () => {
    vi.mocked(getPostById).mockResolvedValue({
      id: "1",
      slug: "game",
      translations: [{ lang: "en", title: "T" }],
    } as never);

    const res = await handleAdminPostItem(
      req("http://x/api/admin/posts/1", { token: await adminToken() }),
      env,
      "1",
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ id: "1", slug: "game" });
  });

  it("returns 404 for a missing post", async () => {
    vi.mocked(getPostById).mockResolvedValue(null as never);

    const res = await handleAdminPostItem(
      req("http://x/api/admin/posts/missing", { token: await adminToken() }),
      env,
      "missing",
    );

    expect(res.status).toBe(404);
  });

  it("updates a post", async () => {
    vi.mocked(updatePost).mockResolvedValue({ id: "1" } as never);

    const res = await handleAdminPostItem(
      req("http://x/api/admin/posts/1", {
        method: "PUT",
        token: await adminToken(),
        body: JSON.stringify({
          slug: "game",
          type: "project",
          author: "Jose",
          translations: [],
        }),
      }),
      env,
      "1",
    );

    expect(res.status).toBe(200);
    expect(updatePost).toHaveBeenCalledWith(
      "1",
      { slug: "game", type: "project", author: "Jose", image: undefined },
      [],
      expect.anything(),
    );
  });

  it("deletes a post", async () => {
    vi.mocked(deletePost).mockResolvedValue(true as never);

    const res = await handleAdminPostItem(
      req("http://x/api/admin/posts/1", {
        method: "DELETE",
        token: await adminToken(),
      }),
      env,
      "1",
    );

    expect(res.status).toBe(200);
    expect(deletePost).toHaveBeenCalledWith("1", expect.anything());
  });
});
