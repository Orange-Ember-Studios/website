import type { TursoCredentials } from "../lib/db.ts";

/** Cloudflare worker env + local dev shim */
export interface SiteEnv extends TursoCredentials {
  ASSETS: Fetcher;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  NODE_ENV?: string;
}

export function tursoCreds(env: SiteEnv): TursoCredentials {
  return {
    TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
  };
}

export const SUPPORTED_LANGS = ["en", "es", "fr"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
