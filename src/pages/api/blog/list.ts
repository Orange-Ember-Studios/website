import type { APIRoute } from 'astro';
import { getPublishedPostsByType } from '../../../lib/posts.service';
import { tursoCreds } from '../../../server/site-env';
import type { SiteEnv } from '../../../server/site-env';
import { ensureDatabaseSchema } from '../../../lib/db-migrations';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const env = locals as SiteEnv;
    await ensureDatabaseSchema({
      TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
    });

    const lang = url.searchParams.get('lang') || 'en';
    const sort = url.searchParams.get('sort') || 'desc';
    const tc = tursoCreds(env);

    const posts = await getPublishedPostsByType('blog', tc);

    const filteredPosts = posts.filter((p) => {
      if (lang === 'en') return !p.id.startsWith('es/') && !p.id.startsWith('fr/');
      return p.id.startsWith(`${lang}/`);
    });

    filteredPosts.sort((a, b) => {
      const dateA = new Date(a.data.pubDate).getTime();
      const dateB = new Date(b.data.pubDate).getTime();
      return sort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return new Response(JSON.stringify(filteredPosts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Blog API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
