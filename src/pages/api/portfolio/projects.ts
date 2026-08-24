import type { APIRoute } from 'astro';
import { getPublishedPostsByType } from '../../../lib/posts.service';
import { mapPortfolioProjects } from '../../../lib/map-portfolio';
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
    const tc = tursoCreds(env);
    const posts = await getPublishedPostsByType('project', tc);
    const mapped = mapPortfolioProjects(posts, lang);

    return new Response(JSON.stringify(mapped), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Portfolio API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
