import type { APIRoute } from 'astro';
import { getPostLikeStatus, likePost } from '../../../../../lib/post-likes.service';
import { EnvManager } from '../../../../../lib/EnvManager';

const VISITOR_COOKIE = 'blog_like_visitor';
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getOrCreateVisitorId(cookies: Parameters<APIRoute>[0]['cookies']) {
  const existingVisitorId = cookies.get(VISITOR_COOKIE)?.value;
  if (existingVisitorId) return existingVisitorId;

  const visitorId = crypto.randomUUID();
  cookies.set(VISITOR_COOKIE, visitorId, {
    path: '/',
    httpOnly: true,
    secure: EnvManager.IS_PROD,
    sameSite: 'lax',
    maxAge: VISITOR_COOKIE_MAX_AGE
  });

  return visitorId;
}

function getPostParams(params: Parameters<APIRoute>[0]['params']) {
  const { lang, slug } = params;
  if (!lang || !slug) return null;

  return {
    lang,
    slug
  };
}

export const GET: APIRoute = async ({ params, cookies }) => {
  const postParams = getPostParams(params);
  if (!postParams) return jsonResponse({ error: 'Missing post parameters' }, 400);

  try {
    const visitorId = getOrCreateVisitorId(cookies);
    const likeStatus = await getPostLikeStatus(postParams.slug, postParams.lang, visitorId);

    if (!likeStatus) return jsonResponse({ error: 'Post not found' }, 404);

    return jsonResponse(likeStatus);
  } catch (error) {
    return jsonResponse({ error: 'Failed to fetch likes' }, 500);
  }
};

export const POST: APIRoute = async ({ params, cookies }) => {
  const postParams = getPostParams(params);
  if (!postParams) return jsonResponse({ error: 'Missing post parameters' }, 400);

  try {
    const visitorId = getOrCreateVisitorId(cookies);
    const likeStatus = await likePost(postParams.slug, postParams.lang, visitorId);

    if (!likeStatus) return jsonResponse({ error: 'Post not found' }, 404);

    return jsonResponse(likeStatus);
  } catch (error) {
    return jsonResponse({ error: 'Failed to like post' }, 500);
  }
};
