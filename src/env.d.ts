import type { SupportedLanguage } from "./i18n/i18n";

declare module "cloudflare:workers" {
  export const env: {
    TURSO_DATABASE_URL?: string;
    TURSO_AUTH_TOKEN?: string;
    [key: string]: unknown;
  };
}

declare global {
  namespace App {
    interface Locals {
      lang: SupportedLanguage;
      user?: { userId: string; username: string };
    }
  }
}
