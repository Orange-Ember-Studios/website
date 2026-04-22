import { getDbClient } from './db';

export async function getAllPosts() {
  const db = getDbClient();
  const res = await db.execute('SELECT * FROM posts ORDER BY created_at DESC');
  return res.rows;
}

export async function getPostById(id: string) {
  const db = getDbClient();

  const postRes = await db.execute({
    sql: 'SELECT * FROM posts WHERE id = ?',
    args: [id]
  });

  if (postRes.rows.length === 0) return null;

  const transRes = await db.execute({
    sql: 'SELECT * FROM post_translations WHERE post_id = ?',
    args: [id]
  });

  return {
    ...postRes.rows[0],
    translations: transRes.rows
  };
}

export async function createPost(post: { slug: string; type: string; author: string; image?: string }, translations: Array<{ lang: string; title: string; content: string; published: boolean }>) {
  const db = getDbClient();
  const id = crypto.randomUUID();

  await db.execute({
    sql: 'INSERT INTO posts (id, slug, type, author, image) VALUES (?, ?, ?, ?, ?)',
    args: [id, post.slug, post.type, post.author, post.image || null]
  });

  for (const t of translations) {
    if (t.title && t.content) {
      await db.execute({
        sql: 'INSERT INTO post_translations (id, post_id, lang, title, content, published) VALUES (?, ?, ?, ?, ?, ?)',
        args: [crypto.randomUUID(), id, t.lang, t.title, t.content, t.published ? 1 : 0]
      });
    }
  }

  return await getPostById(id);
}

export async function updatePost(id: string, post: { slug: string; type: string; author: string; image?: string }, translations: Array<{ lang: string; title: string; content: string; published: boolean }>) {
  const db = getDbClient();

  await db.execute({
    sql: 'UPDATE posts SET slug = ?, type = ?, author = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [post.slug, post.type, post.author, post.image || null, id]
  });

  // Simple override strategy: delete existing and insert new
  await db.execute({
    sql: 'DELETE FROM post_translations WHERE post_id = ?',
    args: [id]
  });

  for (const t of translations) {
    if (t.title && t.content) {
      await db.execute({
        sql: 'INSERT INTO post_translations (id, post_id, lang, title, content, published) VALUES (?, ?, ?, ?, ?, ?)',
        args: [crypto.randomUUID(), id, t.lang, t.title, t.content, t.published ? 1 : 0]
      });
    }
  }

  return await getPostById(id);
}

export async function deletePost(id: string) {
  const db = getDbClient();
  await db.execute({
    sql: 'DELETE FROM posts WHERE id = ?',
    args: [id]
  });
  return true;
}

import { parseEditorJsBlocks } from './editorjs-parser';

export async function getPublishedPostsByType(type: string) {
  const db = getDbClient();
  const res = await db.execute({
    sql: `
    SELECT p.slug, p.type, p.author, p.image, p.created_at, t.lang, t.title, t.content 
    FROM posts p 
    JOIN post_translations t ON p.id = t.post_id 
    WHERE p.type = ? AND t.published = 1
  `,
    args: [type]
  });

  return res.rows.map((row: any) => {
    let description = "";
    let image = "";
    let tags: string[] = [];
    let meta: any = null;

    try {
      const data = JSON.parse(row.content);
      if (data.blocks) {
        const textBlock = data.blocks?.find((b: any) => b.type === "paragraph");
        if (textBlock) {
          description = textBlock.data.text
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .substring(0, 150) + "...";
        }
        const imgBlock = data.blocks?.find((b: any) => b.type === "image");
        if (imgBlock) {
          image = imgBlock.data.file?.url || imgBlock.data.url;
        }
      } else {
        // Direct JSON meta format
        meta = data;
        description = data.description || '';
      }
    } catch (e) { }

    return {
      id: row.lang === 'en' ? row.slug : `${row.lang}/${row.slug}`,
      data: {
        title: row.title as string,
        description,
        image: (row.image as string) || image,
        pubDate: new Date(row.created_at as string),
        author: row.author as string,
        tags,
        meta,
      }
    };
  });
}

export async function getPublishedPostBySlug(slug: string, lang: string) {
  const db = getDbClient();
  const res = await db.execute({
    sql: `SELECT p.slug, p.author, p.image, p.created_at, t.title, t.content 
          FROM posts p 
          JOIN post_translations t ON p.id = t.post_id 
          WHERE t.lang = ? AND p.slug = ? AND t.published = 1`,
    args: [lang, slug]
  });

  if (res.rows.length === 0) return null;
  const post = res.rows[0];

  let htmlContent = "";
  let description = "";
  let words = 0;

  const content = post.content as string;
  try {
    // Try to parse as JSON first (for backward compatibility during migration)
    const data = JSON.parse(content);
    if (data && typeof data === 'object' && data.blocks) {
      htmlContent = await parseEditorJsBlocks(data.blocks || []);
      const textBlock = data.blocks?.find((b: any) => b.type === "paragraph");
      if (textBlock) {
        description = textBlock.data.text
          .replace(/<[^>]*>?/gm, '')
          .replace(/&nbsp;/g, ' ')
          .substring(0, 150) + "...";
      }
      const textBlocks = data.blocks?.filter((b: any) => b.type === "paragraph" || b.type === "header");
      words = textBlocks.reduce((acc: number, b: any) => acc + (b.data.text?.split(/\s+/g).length || 0), 0);
    } else {
      // Fallback or non-block JSON
      htmlContent = await marked.parse(content);
      description = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
      words = content.split(/\s+/g).length;
    }
  } catch (e) {
    // It's already Markdown
    try {
      htmlContent = await marked.parse(content);
    } catch (parseError) {
      console.error("Markdown parse error:", parseError);
      htmlContent = content; // Fallback to raw content
    }
    description = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
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
      tags: [] as string[]
    },
    readingTime,
    htmlContent
  };
}
