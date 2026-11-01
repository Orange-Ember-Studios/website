import type { APIRoute } from "astro";
import { getPublishedPostsByType } from "../lib/posts.service";
import { tursoCreds } from "../server/site-env";
import { ensureDatabaseSchema } from "../lib/db-migrations";

/**
 * Sitemap dinámico: rutas públicas reales del sitio.
 * EXCLUIR deliberadamente: /admin (auth), /api/*, y las fichas
 * /<lang>/projects/<slug> — hoy no existe página para esas rutas (404);
 * se incluirán cuando exista la vista de detalle de proyecto.
 * Proyectos con link externo (Play Store) tampoco van en el sitemap.
 */

export const prerender = false;

const SITE = "https://orangeember.com";
const LANGS = ["en", "es", "fr"] as const;
type Lang = (typeof LANGS)[number];

export interface SitemapPost {
  id: string;
  slug: string;
  published_date?: string | null;
  data?: { pubDate?: string | Date };
}

function slugForLang(post: SitemapPost, lang: Lang): string | null {
  const id = post.id || "";
  if (lang === "en") {
    return id.startsWith("es/") || id.startsWith("fr/") ? null : post.slug || id.split("/").pop() || null;
  }
  return id.startsWith(`${lang}/`) ? post.slug || id.split("/").pop() || null : null;
}

export function buildSitemapEntries(
  blogPosts: SitemapPost[],
  projectPosts: SitemapPost[],
  langs: readonly Lang[] = LANGS
): { loc: string; lastmod?: string }[] {
  const entries: { loc: string; lastmod?: string }[] = [];
  for (const lang of langs) {
    entries.push({ loc: `${SITE}/${lang}/` });
    entries.push({ loc: `${SITE}/${lang}/blog` });
    entries.push({ loc: `${SITE}/${lang}/privacy` });
    for (const p of blogPosts) {
      const slug = slugForLang(p, lang);
      if (!slug) continue;
      const pub = p.data?.pubDate ?? p.published_date;
      const lastmod = pub ? new Date(pub).toISOString().slice(0, 10) : undefined;
      entries.push({ loc: `${SITE}/${lang}/blog/${encodeURIComponent(slug)}`, lastmod });
    }
  }
  return entries;
}

function toXml(entries: { loc: string; lastmod?: string }[]): string {
  const body = entries
    .map((e) =>
      `  <url>\n    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const GET: APIRoute = async ({ locals }) => {
  let blogPosts: SitemapPost[] = [];
  let projectPosts: SitemapPost[] = [];
  let ok = false;
  try {
    const env = locals as unknown as {
      TURSO_DATABASE_URL: string;
      TURSO_AUTH_TOKEN: string;
    };
    await ensureDatabaseSchema({
      TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
    });
    const tc = tursoCreds(env);
    blogPosts = (await getPublishedPostsByType("blog", tc)) as unknown as SitemapPost[];
    projectPosts = (await getPublishedPostsByType("project", tc)) as unknown as SitemapPost[];
    ok = true;
  } catch (error) {
    console.error("[sitemap] DB no disponible, usando rutas estáticas:", error);
  }

  const entries = ok ? buildSitemapEntries(blogPosts, projectPosts) : buildSitemapEntries([], []);
  return new Response(toXml(entries), {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
