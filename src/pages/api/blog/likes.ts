import type { APIRoute } from "astro";
import {
  getLikeCount,
  hashVisitorId,
  isValidPostKey,
  isValidVisitorId,
  recordLike,
  visitorHasLiked,
} from "../../../lib/likes.service";

function clientIp(request: Request): string | null {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  return null;
}

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const postKey = url.searchParams.get("postKey")?.trim() || "";
  const visitorId = url.searchParams.get("visitorId")?.trim() || "";

  if (!isValidPostKey(postKey)) {
    return new Response(JSON.stringify({ error: "Invalid postKey" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const count = await getLikeCount(postKey);
    let liked = false;
    if (isValidVisitorId(visitorId)) {
      const hash = hashVisitorId(visitorId);
      liked = await visitorHasLiked(postKey, hash);
    }
    return new Response(JSON.stringify({ count, liked }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[likes GET]", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  let body: { postKey?: string; visitorId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const postKey = body.postKey?.trim() || "";
  const visitorId = body.visitorId?.trim() || "";

  if (!isValidPostKey(postKey) || !isValidVisitorId(visitorId)) {
    return new Response(JSON.stringify({ error: "Invalid postKey or visitorId" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const hash = hashVisitorId(visitorId);
  const ip = clientIp(request);

  try {
    const already = await visitorHasLiked(postKey, hash);
    if (already) {
      const count = await getLikeCount(postKey);
      return new Response(
        JSON.stringify({ count, liked: true, duplicate: true }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    }

    await recordLike(postKey, hash);
    const count = await getLikeCount(postKey);

    if (ip) {
      console.info(`[like] post=${postKey} ip=${ip}`);
    }

    return new Response(JSON.stringify({ count, liked: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[likes POST]", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
