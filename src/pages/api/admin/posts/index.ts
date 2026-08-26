import type { APIRoute } from "astro";
import { handleAdminPostsCollection } from "../../../../server/admin-posts-api.ts";
import type { SiteEnv } from "../../../../server/site-env.ts";

export const prerender = false;

export const GET: APIRoute = ({ request, locals }) =>
  handleAdminPostsCollection(request, locals as unknown as SiteEnv);

export const POST: APIRoute = ({ request, locals }) =>
  handleAdminPostsCollection(request, locals as unknown as SiteEnv);
