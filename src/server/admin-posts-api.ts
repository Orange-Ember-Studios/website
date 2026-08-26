import { verifyToken } from "../lib/auth.ts";
import { ensureDatabaseSchema } from "../lib/db-migrations.ts";
import { EnvManager } from "../lib/EnvManager.ts";
import type { TursoCredentials } from "../lib/db.ts";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "../lib/posts.service.ts";
import { tursoCreds, type SiteEnv } from "./site-env.ts";

export interface AdminPostPayload {
  slug?: string;
  type?: string;
  author?: string;
  image?: string;
  translations?: Array<{
    lang: string;
    title: string;
    content: string;
    published: boolean;
  }>;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function unauthorized(): Response {
  return json({ error: "Unauthorized" }, 401);
}

function readAdminToken(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== "admin_token") continue;
    return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

async function isAdmin(request: Request, env: SiteEnv): Promise<boolean> {
  const token = readAdminToken(request);
  if (!token) return false;
  const payload = await verifyToken(token, env?.JWT_SECRET || undefined);
  return Boolean(payload?.userId && payload?.username);
}

async function readPayload(request: Request): Promise<AdminPostPayload | null> {
  try {
    return (await request.json()) as AdminPostPayload;
  } catch {
    return null;
  }
}

/**
 * Astro `locals` does not carry the Turso bindings, so fall back to the process
 * env (populated by `nodejs_compat` in Workers and by `.env.local` in dev).
 */
async function prepare(env: SiteEnv): Promise<TursoCredentials> {
  const bound = tursoCreds(env ?? ({} as SiteEnv));
  const creds: TursoCredentials = {
    TURSO_DATABASE_URL:
      bound.TURSO_DATABASE_URL || EnvManager.TURSO_DATABASE_URL || undefined,
    TURSO_AUTH_TOKEN:
      bound.TURSO_AUTH_TOKEN || EnvManager.TURSO_AUTH_TOKEN || undefined,
  };
  await ensureDatabaseSchema(creds);
  return creds;
}

/** GET (list) + POST (create) for `/api/admin/posts`. */
export async function handleAdminPostsCollection(
  request: Request,
  env: SiteEnv,
): Promise<Response> {
  if (!(await isAdmin(request, env))) return unauthorized();

  try {
    const creds = await prepare(env);

    if (request.method === "GET") {
      const type = new URL(request.url).searchParams.get("type")?.trim();
      const posts = await getAllPosts(creds, type ? { type } : undefined);
      return json(posts);
    }

    if (request.method === "POST") {
      const data = await readPayload(request);
      if (!data?.slug || !data.type || !data.author) {
        return json({ error: "Missing slug, type, or author" }, 400);
      }
      const created = await createPost(
        {
          slug: data.slug,
          type: data.type,
          author: data.author,
          image: data.image,
        },
        data.translations ?? [],
        creds,
      );
      return json(created, 201);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("[admin posts]", error);
    return json({ error: "Failed to process posts request" }, 500);
  }
}

/** GET + PUT + DELETE for `/api/admin/posts/:id`. */
export async function handleAdminPostItem(
  request: Request,
  env: SiteEnv,
  id: string,
): Promise<Response> {
  if (!(await isAdmin(request, env))) return unauthorized();
  if (!id) return json({ error: "Missing post id" }, 400);

  try {
    const creds = await prepare(env);

    if (request.method === "GET") {
      const post = await getPostById(id, creds);
      if (!post) return json({ error: "Post not found" }, 404);
      return json(post);
    }

    if (request.method === "PUT") {
      const data = await readPayload(request);
      if (!data?.slug || !data.type || !data.author) {
        return json({ error: "Missing slug, type, or author" }, 400);
      }
      const updated = await updatePost(
        id,
        {
          slug: data.slug,
          type: data.type,
          author: data.author,
          image: data.image,
        },
        data.translations ?? [],
        creds,
      );
      if (!updated) return json({ error: "Post not found" }, 404);
      return json(updated);
    }

    if (request.method === "DELETE") {
      await deletePost(id, creds);
      return json({ success: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("[admin post item]", error);
    return json({ error: "Failed to process post request" }, 500);
  }
}
