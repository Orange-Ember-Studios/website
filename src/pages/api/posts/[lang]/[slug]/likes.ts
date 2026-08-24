import type { APIRoute } from 'astro';
import { getDbClient } from '../../../../../lib/db';

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const { lang, slug } = params;

    if (!lang || !slug) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDbClient();
    const postId = `${lang}/${slug}`;

    const likesRes = await db.execute({
      sql: 'SELECT like_count FROM post_likes WHERE post_id = ?',
      args: [postId]
    });

    const liked = cookies.get('liked_posts')?.value || '';
    const likedArray = liked ? liked.split(',') : [];
    const isLiked = likedArray.includes(postId);

    const count = likesRes.rows.length > 0 ? (likesRes.rows[0].like_count as number) : 0;

    return new Response(JSON.stringify({ count, liked: isLiked }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Post Likes API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, cookies }) => {
  try {
    const { lang, slug } = params;

    if (!lang || !slug) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDbClient();
    const postId = `${lang}/${slug}`;

    await db.execute({
      sql: `INSERT INTO post_likes (post_id, created_at) VALUES (?, CURRENT_TIMESTAMP)
            ON CONFLICT(post_id) DO UPDATE SET like_count = like_count + 1`,
      args: [postId]
    });

    const liked = cookies.get('liked_posts')?.value || '';
    const likedArray = liked ? liked.split(',') : [];
    if (!likedArray.includes(postId)) {
      likedArray.push(postId);
    }
    cookies.set('liked_posts', likedArray.join(','), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365
    });

    const likesRes = await db.execute({
      sql: 'SELECT like_count FROM post_likes WHERE post_id = ?',
      args: [postId]
    });

    const count = likesRes.rows.length > 0 ? (likesRes.rows[0].like_count as number) : 1;

    return new Response(JSON.stringify({ count, liked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Post Likes API] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
