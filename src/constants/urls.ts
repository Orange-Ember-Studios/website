/**
 * API and External Service URLs for Orange Ember Studios
 */

export const API_URLS = {
  // Cloudflare Turnstile
  TURNSTILE_VERIFY: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  TURNSTILE_SCRIPT: "https://challenges.cloudflare.com/turnstile/v0/api.js",

  // Resend
  RESEND_EMAILS: "https://api.resend.com/emails",

  // Internal Endpoints
  CONTACT_FORM_SUBMISSION: "/api/contact",
} as const;

export const SOCIAL_URLS = {
  GITHUB: "https://github.com/Orange-Ember-Studios",
  TWITTER_X: "https://x.com/OrangeEmberSt",
} as const;

export const SITE_URLS = {
  BASE: "https://orangeember.com",
  EASY_FLAGS: "https://easy-flags.orangeember.com/",
  CDN_BASE: "https://raw.githubusercontent.com/Orange-Ember-Studios/cdn-resources/main",
} as const;

export const EXTERNAL_URLS = {
  GOOGLE_FONTS: "https://fonts.googleapis.com",
  GOOGLE_GSTATIC: "https://fonts.gstatic.com",
  SCHEMA_ORG: "https://schema.org",
} as const;
