import type { APIRoute } from 'astro';
import { getPublishedPostBySlug } from '../../../../lib/posts.service';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { lang, slug } = params;

    if (!lang || !slug) {
      return new Response(JSON.stringify({ error: 'Missing lang or slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const post = await getPublishedPostBySlug(slug, lang);

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
