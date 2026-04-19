/**
 * EnvManager handles environment variables access across the application.
 * It abstracts the differences between Astro's import.meta.env and Node's process.env.
 */
export class EnvManager {
  /**
   * Internal helper to get an environment variable with fallback logic.
   * Checks import.meta.env first (Astro standard) then process.env (Node fallback).
   */
  private static getVar(key: string, required: boolean = true): string | undefined {
    // @ts-ignore - Handle runtime environments where process or import.meta might be partially available
    const value = import.meta.env[key] || (typeof process !== 'undefined' ? process.env[key] : undefined);
    
    if (required && value === undefined) {
      console.warn(`[EnvManager] Warning: Environment variable "${key}" is not set.`);
    }
    
    return value;
  }

  /**
   * Public key for Cloudflare Turnstile (available on the client)
   */
  static get PUBLIC_TURNSTILE_SITE_KEY(): string {
    return this.getVar('PUBLIC_TURNSTILE_SITE_KEY') || '';
  }

  /**
   * Secret key for Cloudflare Turnstile (Server-only)
   */
  static get TURNSTILE_SECRET_KEY(): string {
    return this.getVar('TURNSTILE_SECRET_KEY') || '';
  }

  /**
   * API Key for Resend Email Service (Server-only)
   */
  static get RESEND_API_KEY(): string {
    return this.getVar('RESEND_API_KEY') || '';
  }

  /**
   * Turso Database URL (Server-only)
   */
  static get TURSO_DATABASE_URL(): string {
    return this.getVar('TURSO_DATABASE_URL') || '';
  }

  /**
   * Turso Auth Token (Server-only)
   */
  static get TURSO_AUTH_TOKEN(): string {
    return this.getVar('TURSO_AUTH_TOKEN') || '';
  }

  /**
   * Secret key for JWT signing (Server-only)
   */
  static get JWT_SECRET(): string {
    return this.getVar('JWT_SECRET') || 'orange-ember-fallback-secret-for-dev';
  }

  /**
   * Generic check to see if we are in development mode
   */
  static get IS_DEV(): boolean {
    return import.meta.env.DEV || (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');
  }

  /**
   * Generic check to see if we are in production mode
   */
  static get IS_PROD(): boolean {
    return import.meta.env.PROD || (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
  }
}
