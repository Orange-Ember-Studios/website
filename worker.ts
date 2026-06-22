import {
  handleApiRequest,
  getAdminUserFromRequest,
} from "./src/server/api-router";
import { detectLangFromRequest } from "./src/lib/lang";
import { SUPPORTED_LANGS, type SiteEnv } from "./src/server/site-env";

export interface Env {
  ASSETS: Fetcher;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
}

async function injectPublicEnv(response: Response, env: Env): Promise<Response> {
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return response;
  const html = await response.text();
  const payload = JSON.stringify({
    PUBLIC_TURNSTILE_SITE_KEY: env.PUBLIC_TURNSTILE_SITE_KEY ?? "",
  });
  const injected = html.replace("<head>", `<head><script>window.__CF_ENV__=${payload}</script>`);
  return new Response(injected, { status: response.status, statusText: response.statusText, headers: response.headers });
}

function toSiteEnv(env: Env): SiteEnv {
  return {
    ASSETS: env.ASSETS,
    TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
    JWT_SECRET: env.JWT_SECRET,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY,
    RESEND_API_KEY: env.RESEND_API_KEY,
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      return handleApiRequest(request, toSiteEnv(env));
    }

    if (pathname === "/") {
      const lang = detectLangFromRequest(request);
      return Response.redirect(new URL(`/${lang}/`, url), 302);
    }

    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    if (
      first &&
      !SUPPORTED_LANGS.includes(first as (typeof SUPPORTED_LANGS)[number]) &&
      first !== "admin" &&
      first !== "404" &&
      !first.includes(".")
    ) {
      return Response.redirect(new URL("/404", url), 302);
    }

    if (
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/login")
    ) {
      const user = await getAdminUserFromRequest(request, toSiteEnv(env));
      if (!user) {
        return Response.redirect(new URL("/admin/login", url), 302);
      }
    }

    return injectPublicEnv(await env.ASSETS.fetch(request), env);
  },
};
