import { getDbClient, type TursoCredentials } from "./db.ts";
import { marked } from "marked";
import { createHighlighter, createJavaScriptRegexEngine } from "shiki";
import { parseEditorJsBlocks } from "./content-parser.ts";
import {
  CODE_LANGUAGES,
  normalizeCodeLanguage,
} from "./editorjs-code-languages.ts";

const EMPTY_EDITOR_JS = '{"blocks":[]}';

function normalizeTranslationRow(t: {
  lang: string;
  title: string;
  content: string;
  published: boolean;
}): { lang: string; title: string; content: string; published: boolean } | null {
  const title = String(t.title ?? "").trim();
  const rawContent = String(t.content ?? "");
  const contentTrim = rawContent.trim();
  if (!title && !contentTrim) return null;
  const content = contentTrim ? rawContent : EMPTY_EDITOR_JS;
  return { lang: t.lang, title, content, published: t.published };
}

const highlighter = await createHighlighter({
  themes: ["github-dark"],
  langs: CODE_LANGUAGES.map((l) => l.id).filter((id) => id !== "text"),
  engine: createJavaScriptRegexEngine(),
});

marked.use({
  async: true,
  renderer: {
    code(token) {
      const { text, lang } = token;
      if (!lang) return `<pre><code>${text}</code></pre>`;
      try {
        return highlighter.codeToHtml(text, {
          lang: normalizeCodeLanguage(lang),
          theme: "github-dark",
        });
      } catch {
        return `<pre><code class="language-${lang}">${text}</code></pre>`;
      }
    },
  },
});

export async function getAllPosts(
  creds?: TursoCredentials,
  options?: { type?: string },
) {
  const db = getDbClient(creds);
  const type = options?.type?.trim();
  if (type) {
    const res = await db.execute({
      sql: "SELECT * FROM posts WHERE type = ? ORDER BY created_at DESC",
      args: [type],
    });
    return res.rows;
  }
  const res = await db.execute("SELECT * FROM posts ORDER BY created_at DESC");
  return res.rows;
}

export async function getPostById(id: string, creds?: TursoCredentials) {
  const db = getDbClient(creds);

  const postRes = await db.execute({
    sql: "SELECT * FROM posts WHERE id = ?",
    args: [id],
  });

  if (postRes.rows.length === 0) return null;

  const transRes = await db.execute({
    sql: "SELECT * FROM post_translations WHERE post_id = ?",
    args: [id],
  });

  return {
    ...postRes.rows[0],
    translations: transRes.rows,
  };
}

export async function createPost(
  post: { slug: string; type: string; author: string; image?: string },
  translations: Array<{
    lang: string;
    title: string;
    content: string;
    published: boolean;
  }>,
  creds?: TursoCredentials,
) {
  const db = getDbClient(creds);
  const id = crypto.randomUUID();

  await db.execute({
    sql: "INSERT INTO posts (id, slug, type, author, image) VALUES (?, ?, ?, ?, ?)",
    args: [id, post.slug, post.type, post.author, post.image || null],
  });

  for (const t of translations) {
    const row = normalizeTranslationRow(t);
    if (!row) continue;
    await db.execute({
      sql: "INSERT INTO post_translations (id, post_id, lang, title, content, published) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        crypto.randomUUID(),
        id,
        row.lang,
        row.title,
        row.content,
        row.published ? 1 : 0,
      ],
    });
  }

  return await getPostById(id, creds);
}

export async function updatePost(
  id: string,
  post: { slug: string; type: string; author: string; image?: string },
  translations: Array<{
    lang: string;
    title: string;
    content: string;
    published: boolean;
  }>,
  creds?: TursoCredentials,
) {
  const db = getDbClient(creds);

  await db.execute({
    sql: "UPDATE posts SET slug = ?, type = ?, author = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    args: [post.slug, post.type, post.author, post.image || null, id],
  });

  await db.execute({
    sql: "DELETE FROM post_translations WHERE post_id = ?",
    args: [id],
  });

  for (const t of translations) {
    const row = normalizeTranslationRow(t);
    if (!row) continue;
    await db.execute({
      sql: "INSERT INTO post_translations (id, post_id, lang, title, content, published) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        crypto.randomUUID(),
        id,
        row.lang,
        row.title,
        row.content,
        row.published ? 1 : 0,
      ],
    });
  }

  return await getPostById(id, creds);
}

export async function deletePost(id: string, creds?: TursoCredentials) {
  const db = getDbClient(creds);
  await db.execute({
    sql: "DELETE FROM posts WHERE id = ?",
    args: [id],
  });
  return true;
}

function plainTextExcerpt(text: string, maxLen = 150): string {
  const plain = text
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen)}...`;
}

/** Excerpt for blog/project list cards (Editor.js JSON, meta JSON, or markdown). */
export function excerptFromPostContent(content: string): string {
  const trimmed = String(content ?? "").trim();
  if (!trimmed) return "";

  try {
    const data = JSON.parse(trimmed);
    if (data?.blocks) {
      const textBlock = data.blocks.find((b: { type?: string }) => b.type === "paragraph");
      if (textBlock?.data?.text) {
        return plainTextExcerpt(String(textBlock.data.text));
      }
      return "";
    }
    if (typeof data?.description === "string" && data.description.trim()) {
      try {
        const desc = JSON.parse(data.description) as { blocks?: { type?: string; data?: { text?: string } }[] };
        if (desc?.blocks) {
          const textBlock = desc.blocks.find((b) => b.type === "paragraph");
          if (textBlock?.data?.text) {
            return plainTextExcerpt(String(textBlock.data.text));
          }
          return "";
        }
      } catch {
        /* plain markdown / text */
      }
      return plainTextExcerpt(data.description);
    }
  } catch {
    return plainTextExcerpt(trimmed);
  }

  return "";
}

export async function getPublishedPostsByType(
  type: string,
  creds?: TursoCredentials,
) {
  const db = getDbClient(creds);
  const res = await db.execute({
    sql: `
    SELECT p.slug, p.type, p.author, p.image, p.created_at, t.lang, t.title, t.content 
    FROM posts p 
    JOIN post_translations t ON p.id = t.post_id 
    WHERE p.type = ? AND t.published = 1
  `,
    args: [type],
  });

  return res.rows.map((row: any) => {
    let description = excerptFromPostContent(row.content as string);
    let image = "";
    const tags: string[] = [];
    let meta: Record<string, unknown> | null = null;

    try {
      const data = JSON.parse(row.content as string);
      if (data?.blocks) {
        const imgBlock = data.blocks?.find((b: { type?: string }) => b.type === "image");
        if (imgBlock) {
          image = imgBlock.data?.file?.url || imgBlock.data?.url || "";
        }
      } else if (data && typeof data === "object") {
        meta = data;
        if (!description && typeof data.description === "string") {
          description = plainTextExcerpt(data.description);
        }
      }
    } catch {
      /* markdown handled by excerptFromPostContent */
    }

    return {
      id: row.lang === "en" ? row.slug : `${row.lang}/${row.slug}`,
      data: {
        title: row.title as string,
        description,
        image: (row.image as string) || image,
        pubDate: new Date(row.created_at as string),
        author: row.author as string,
        tags,
        meta,
      },
    };
  });
}

export async function getPublishedPostBySlug(
  slug: string,
  lang: string,
  creds?: TursoCredentials,
) {
  const db = getDbClient(creds);
  const res = await db.execute({
    sql: `SELECT p.slug, p.author, p.image, p.created_at, t.title, t.content 
          FROM posts p 
          JOIN post_translations t ON p.id = t.post_id 
          WHERE t.lang = ? AND p.slug = ? AND t.published = 1`,
    args: [lang, slug],
  });

  if (res.rows.length === 0) return null;
  const post = res.rows[0];

  let htmlContent = "";
  let description = "";
  let words = 0;

  const content = post.content as string;
  try {
    const data = JSON.parse(content);
    if (data && typeof data === "object" && data.blocks) {
      htmlContent = await parseEditorJsBlocks(data.blocks || []);
      const textBlock = data.blocks?.find((b: any) => b.type === "paragraph");
      if (textBlock) {
        description =
          textBlock.data.text
            .replace(/<[^>]*>?/gm, "")
            .replace(/&nbsp;/g, " ")
            .substring(0, 150) + "...";
      }
      const textBlocks = data.blocks?.filter(
        (b: any) => b.type === "paragraph" || b.type === "header",
      );
      words = textBlocks.reduce(
        (acc: number, b: any) => acc + (b.data.text?.split(/\s+/g).length || 0),
        0,
      );
    } else {
      htmlContent = await marked.parse(content);
      description =
        content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...";
      words = content.split(/\s+/g).length;
    }
  } catch {
    try {
      htmlContent = await marked.parse(content);
    } catch (parseError) {
      console.error("Markdown parse error:", parseError);
      htmlContent = content;
    }
    description = content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...";
    words = content.split(/\s+/g).length;
  }

  const readingTime = Math.ceil((words || 1) / 200);

  return {
    frontmatter: {
      title: post.title as string,
      description,
      pubDate: new Date(post.created_at as string),
      author: post.author as string,
      image: post.image as string,
      tags: [] as string[],
    },
    readingTime,
    htmlContent,
  };
}
