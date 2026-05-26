import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createPost, getPostById, updatePost } from "./posts.service.ts";
import type { TursoCredentials } from "./db.ts";
import { getDbClient } from "./db.ts";

const LANGS = ["en", "es", "fr"] as const;
export type BlogSeedLang = (typeof LANGS)[number];

export type BlogPostSeedMeta = {
  slug: string;
  author: string;
  titles: Record<BlogSeedLang, string>;
};

export type BlogPostSeedBundle = BlogPostSeedMeta & {
  content: Record<BlogSeedLang, string>;
};

export async function loadBlogPostSeedBundle(
  postDir: string,
): Promise<BlogPostSeedBundle> {
  const metaRaw = await readFile(join(postDir, "meta.json"), "utf8");
  const meta = JSON.parse(metaRaw) as BlogPostSeedMeta;

  const content = {} as Record<BlogSeedLang, string>;
  for (const lang of LANGS) {
    content[lang] = await readFile(join(postDir, `${lang}.md`), "utf8");
  }

  for (const lang of LANGS) {
    if (!meta.titles[lang]?.trim()) {
      throw new Error(`Missing title for ${meta.slug} (${lang})`);
    }
    if (!content[lang].trim()) {
      throw new Error(`Missing content for ${meta.slug} (${lang})`);
    }
  }

  return { ...meta, content };
}

export async function listBlogPostSeedDirs(contentRoot: string): Promise<string[]> {
  const entries = await readdir(contentRoot, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => join(contentRoot, e.name));
}

export type SeedBlogPostsOptions = {
  contentRoot: string;
  published?: boolean;
  /** When true, replace translations on existing slugs. */
  updateExisting?: boolean;
};

export type SeedBlogPostsResult = {
  created: string[];
  updated: string[];
  skipped: string[];
};

export async function seedBlogPostsFromContent(
  creds: TursoCredentials | undefined,
  options: SeedBlogPostsOptions,
): Promise<SeedBlogPostsResult> {
  const published = options.published ?? false;
  const updateExisting = options.updateExisting ?? true;
  const dirs = await listBlogPostSeedDirs(options.contentRoot);

  const result: SeedBlogPostsResult = {
    created: [],
    updated: [],
    skipped: [],
  };

  const db = getDbClient(creds);

  for (const dir of dirs) {
    const bundle = await loadBlogPostSeedBundle(dir);
    const existing = await db.execute({
      sql: "SELECT id FROM posts WHERE slug = ?",
      args: [bundle.slug],
    });

    const translations = LANGS.map((lang) => ({
      lang,
      title: bundle.titles[lang],
      content: bundle.content[lang].trim(),
      published,
    }));

    if (existing.rows.length === 0) {
      await createPost(
        {
          slug: bundle.slug,
          type: "blog",
          author: bundle.author,
        },
        translations,
        creds,
      );
      result.created.push(bundle.slug);
      continue;
    }

    if (!updateExisting) {
      result.skipped.push(bundle.slug);
      continue;
    }

    const id = String(existing.rows[0].id);
    const current = await getPostById(id, creds);
    if (!current) {
      throw new Error(`Post ${bundle.slug} exists but could not be loaded`);
    }

    await updatePost(
      id,
      {
        slug: bundle.slug,
        type: "blog",
        author: bundle.author,
        image: (current.image as string | undefined) ?? undefined,
      },
      translations,
      creds,
    );
    result.updated.push(bundle.slug);
  }

  return result;
}
