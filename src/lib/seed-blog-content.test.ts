import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loadBlogPostSeedBundle,
  seedBlogPostsFromContent,
} from "./seed-blog-content.ts";

vi.mock("./posts.service.ts", () => ({
  createPost: vi.fn().mockResolvedValue({ id: "new-id" }),
  getPostById: vi.fn(),
  updatePost: vi.fn().mockResolvedValue({ id: "updated-id" }),
}));

vi.mock("./db.ts", () => ({
  getDbClient: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  })),
}));

describe("loadBlogPostSeedBundle", () => {
  let tempDir = "";

  afterEach(async () => {
    if (tempDir) {
      await import("node:fs/promises").then(({ rm }) =>
        rm(tempDir, { recursive: true, force: true }),
      );
      tempDir = "";
    }
  });

  it("loads meta and markdown per language", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "blog-seed-"));
    await writeFile(
      join(tempDir, "meta.json"),
      JSON.stringify({
        slug: "test-post",
        author: "Orange Ember Studios",
        titles: { en: "EN Title", es: "ES Title", fr: "FR Title" },
      }),
    );
    await mkdir(join(tempDir), { recursive: true });
    for (const lang of ["en", "es", "fr"] as const) {
      await writeFile(join(tempDir, `${lang}.md`), `Body ${lang}`);
    }

    const bundle = await loadBlogPostSeedBundle(tempDir);
    expect(bundle.slug).toBe("test-post");
    expect(bundle.content.en).toBe("Body en");
    expect(bundle.titles.fr).toBe("FR Title");
  });
});

describe("seedBlogPostsFromContent", () => {
  it("creates posts when slug is missing", async () => {
    const { createPost } = await import("./posts.service.ts");
    const root = await mkdtemp(join(tmpdir(), "blog-root-"));
    const postDir = join(root, "sample-post");
    await mkdir(postDir, { recursive: true });
    await writeFile(
      join(postDir, "meta.json"),
      JSON.stringify({
        slug: "sample-post",
        author: "Orange Ember Studios",
        titles: { en: "A", es: "B", fr: "C" },
      }),
    );
    for (const lang of ["en", "es", "fr"]) {
      await writeFile(join(postDir, `${lang}.md`), `Content ${lang}`);
    }

    const result = await seedBlogPostsFromContent(undefined, {
      contentRoot: root,
      published: false,
    });

    expect(result.created).toEqual(["sample-post"]);
    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "sample-post", type: "blog" }),
      expect.arrayContaining([
        expect.objectContaining({ lang: "en", published: false }),
      ]),
      undefined,
    );

    await import("node:fs/promises").then(({ rm }) =>
      rm(root, { recursive: true, force: true }),
    );
  });
});
