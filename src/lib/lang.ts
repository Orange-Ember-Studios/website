/**
 * Language detection utilities.
 *
 * Lives in its own module (no shiki, no api-router imports) so the root
 * route can import it for SSR without dragging the markdown pipeline
 * into the bundle. Keeping this dependency-free keeps the prerender
 * step and initial client route cheap.
 */

export const SUPPORTED_LANGS = ["en", "es", "fr"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const COOKIE_NAME = "x-language";
const SUPPORTED_SET = new Set<string>(SUPPORTED_LANGS);

function parseCookieHeader(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function detectLangFromRequest(request: Request): SupportedLang {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  const cookieLang = cookies[COOKIE_NAME];
  if (cookieLang && SUPPORTED_SET.has(cookieLang)) return cookieLang as SupportedLang;

  const acceptLang = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (acceptLang.includes("es")) return "es";
  if (acceptLang.includes("fr")) return "fr";
  return "en";
}
