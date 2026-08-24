import type { APIRoute } from 'astro';
import { getPublishedPostBySlug } from '../../../../lib/posts.service';
import { tursoCreds } from '../../../../server/site-env';
import type { SiteEnv } from '../../../../server/site-env';
import { ensureDatabaseSchema } from '../../../../lib/db-migrations';

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const env = locals as SiteEnv;
    await ensureDatabaseSchema({
      TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
    });

    const { lang, slug } = params;

    if (!lang || !slug) {
      return new Response(JSON.stringify({ error: 'Missing lang or slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tc = tursoCreds(env);
    const post = await getPublishedPostBySlug(slug, lang, tc);

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Blog Post API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
