import type { APIRoute } from "astro";
import { handleAdminPostItem } from "../../../../server/admin-posts-api.ts";
import type { SiteEnv } from "../../../../server/site-env.ts";

export const prerender = false;

const handler: APIRoute = ({ request, params, locals }) =>
  handleAdminPostItem(
    request,
    locals as unknown as SiteEnv,
    String(params.id ?? ""),
  );

export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
