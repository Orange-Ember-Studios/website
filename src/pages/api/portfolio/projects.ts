import type { APIRoute } from 'astro';
import { getPublishedPostsByType } from '../../../lib/posts.service';

export const GET: APIRoute = async ({ url }) => {
  try {
    const lang = url.searchParams.get('lang') || 'en';
    const posts = await getPublishedPostsByType('blog');

    const filteredPosts = posts.filter((p) => {
      if (lang === 'en') return !p.id.startsWith('es/') && !p.id.startsWith('fr/');
      return p.id.startsWith(`${lang}/`);
    });

    return new Response(JSON.stringify(filteredPosts), {
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
