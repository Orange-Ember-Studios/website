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
    getPublishedPostBySlug: vi.fn(),
    getAllPosts: vi.fn(),
  };
});

vi.mock("../lib/post-likes.service.ts", () => ({
  getPostLikeStatus: vi.fn(),
  likePost: vi.fn(),
}));

import {
  getPublishedPostsByType,
  getPublishedPostBySlug,
  getAllPosts,
} from "../lib/posts.service.ts";
import { getPostLikeStatus, likePost } from "../lib/post-likes.service.ts";

const env: SiteEnv = {
  ASSETS: null as unknown as Fetcher,
  TURSO_DATABASE_URL: "http://local",
  TURSO_AUTH_TOKEN: "token",
  JWT_SECRET: "test-secret",
  TURNSTILE_SECRET_KEY: "",
  RESEND_API_KEY: "",
};

describe("GET /api/blog/list", () => {
  beforeEach(() => {
    vi.mocked(getPublishedPostsByType).mockReset();
  });

  it("returns 200 JSON without admin_token", async () => {
    vi.mocked(getPublishedPostsByType).mockResolvedValue([
      {
        id: "hello-world",
        data: {
          title: "Hello",
          description: "World",
          pubDate: new Date("2024-01-01"),
          author: "Orange Ember",
        },
      },
    ] as never);

    const res = await handleApiRequest(
      new Request("http://localhost/api/blog/list?lang=en"),
      env,
    );

    expect(res.status).toBe(200);
    expect(getPublishedPostsByType).toHaveBeenCalledWith("blog", expect.anything());
    const body = (await res.json()) as { data: { title: string } }[];
    expect(body).toHaveLength(1);
    expect(body[0].data.title).toBe("Hello");
  });

  it("filters Spanish posts when lang=en", async () => {
    vi.mocked(getPublishedPostsByType).mockResolvedValue([
      {
        id: "hello-world",
        data: {
          title: "EN",
          description: "",
          pubDate: new Date("2024-01-01"),
          author: "Orange Ember",
        },
      },
      {
        id: "es/hola",
        data: {
          title: "ES",
          description: "",
          pubDate: new Date("2024-01-02"),
          author: "Orange Ember",
        },
      },
    ] as never);

    const res = await handleApiRequest(
      new Request("http://localhost/api/blog/list?lang=en"),
      env,
    );
    const body = (await res.json()) as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("hello-world");
  });
});

describe("GET /api/blog/:lang/:slug", () => {
  beforeEach(() => {
    vi.mocked(getPublishedPostBySlug).mockReset();
  });

  it("returns 200 JSON without admin_token", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue({
      frontmatter: {
        title: "Hello",
        description: "World",
        pubDate: new Date("2024-01-01"),
        author: "Orange Ember",
      },
      readingTime: 3,
      htmlContent: "<p>Hi</p>",
    } as never);

    const res = await handleApiRequest(
      new Request("http://localhost/api/blog/en/hello-world"),
      env,
    );

    expect(res.status).toBe(200);
    expect(getPublishedPostBySlug).toHaveBeenCalledWith(
      "hello-world",
      "en",
      expect.anything(),
    );
    const body = (await res.json()) as { frontmatter: { title: string } };
    expect(body.frontmatter.title).toBe("Hello");
  });

  it("returns 404 when post is not published", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(null);

    const res = await handleApiRequest(
      new Request("http://localhost/api/blog/en/missing"),
      env,
    );

    expect(res.status).toBe(404);
  });
});

describe("GET /api/posts/:lang/:slug/likes", () => {
  beforeEach(() => {
    vi.mocked(getPostLikeStatus).mockReset();
    vi.mocked(likePost).mockReset();
  });

  it("returns 200 JSON without admin_token", async () => {
    vi.mocked(getPostLikeStatus).mockResolvedValue({ count: 2, liked: false });

    const res = await handleApiRequest(
      new Request("http://localhost/api/posts/en/hello-world/likes"),
      env,
    );

    expect(res.status).toBe(200);
    expect(getPostLikeStatus).toHaveBeenCalledWith(
      "hello-world",
      "en",
      expect.any(String),
      expect.anything(),
    );
    expect(await res.json()).toEqual({ count: 2, liked: false });
  });

  it("sets visitor cookie when missing", async () => {
    vi.mocked(getPostLikeStatus).mockResolvedValue({ count: 0, liked: false });

    const res = await handleApiRequest(
      new Request("http://localhost/api/posts/en/hello-world/likes"),
      env,
    );

    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("blog_like_visitor=");
  });

  it("returns 404 when post is not published", async () => {
    vi.mocked(getPostLikeStatus).mockResolvedValue(null);

    const res = await handleApiRequest(
      new Request("http://localhost/api/posts/en/missing/likes"),
      env,
    );

    expect(res.status).toBe(404);
  });
});

describe("POST /api/posts/:lang/:slug/likes", () => {
  beforeEach(() => {
    vi.mocked(likePost).mockReset();
  });

  it("returns 200 JSON without admin_token", async () => {
    vi.mocked(likePost).mockResolvedValue({ count: 3, liked: true });

    const res = await handleApiRequest(
      new Request("http://localhost/api/posts/en/hello-world/likes", {
        method: "POST",
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(likePost).toHaveBeenCalledWith(
      "hello-world",
      "en",
      expect.any(String),
      expect.anything(),
    );
    expect(await res.json()).toEqual({ count: 3, liked: true });
  });

  it("returns 405 for unsupported methods", async () => {
    const res = await handleApiRequest(
      new Request("http://localhost/api/posts/en/hello-world/likes", {
        method: "DELETE",
      }),
      env,
    );

    expect(res.status).toBe(405);
    expect(likePost).not.toHaveBeenCalled();
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
});
