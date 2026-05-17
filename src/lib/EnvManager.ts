/**
 * Environment variables (Vite + optional Cloudflare worker bindings via callers).
 */
export class EnvManager {
  private static getVar(key: string, required: boolean = true): string | undefined {
    let value: string | undefined;

    try {
      if (typeof import.meta !== "undefined" && import.meta.env) {
        value = (import.meta.env as Record<string, string | undefined>)[key];
      }
    } catch {
      /* ignore */
    }

    if (value === undefined && typeof process !== "undefined") {
      value = process.env[key];
    }

    if (required && value === undefined) {
      console.warn(`[EnvManager] Warning: Environment variable "${key}" is not set.`);
    }

    return value;
  }

  static get PUBLIC_TURNSTILE_SITE_KEY(): string {
    if (typeof window !== "undefined" && (window as any).__CF_ENV__?.PUBLIC_TURNSTILE_SITE_KEY) {
      return (window as any).__CF_ENV__.PUBLIC_TURNSTILE_SITE_KEY;
    }
    return this.getVar("PUBLIC_TURNSTILE_SITE_KEY", false) ?? "";
  }

  static get TURNSTILE_SECRET_KEY(): string {
    return this.getVar("TURNSTILE_SECRET_KEY", false) ?? "";
  }

  static get RESEND_API_KEY(): string {
    return this.getVar("RESEND_API_KEY", false) ?? "";
  }

  static get TURSO_DATABASE_URL(): string {
    return this.getVar("TURSO_DATABASE_URL", false) ?? "";
  }

  static get TURSO_AUTH_TOKEN(): string {
    return this.getVar("TURSO_AUTH_TOKEN", false) ?? "";
  }

  static get JWT_SECRET(): string {
    return (
      this.getVar("JWT_SECRET", false) ?? "orange-ember-fallback-secret-for-dev"
    );
  }

  static get IS_DEV(): boolean {
    return (
      (typeof import.meta !== "undefined" &&
        !!(import.meta as any).env?.DEV) ||
      (typeof process !== "undefined" && process.env.NODE_ENV === "development")
    );
  }

  static get IS_PROD(): boolean {
    return (
      (typeof import.meta !== "undefined" &&
        !!(import.meta as any).env?.PROD) ||
      (typeof process !== "undefined" && process.env.NODE_ENV === "production")
    );
  }
}
