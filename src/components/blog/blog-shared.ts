export type BlogListPost = {
  id: string;
  data: {
    title: string;
    description: string;
    image?: string;
    pubDate: string;
    author: string;
    tags?: string[];
    meta?: { tags?: string[] };
  };
};

export type BlogPostPayload = {
  frontmatter: {
    title: string;
    description?: string;
    pubDate: string;
    author: string;
    image?: string;
    tags?: string[];
  };
  readingTime: number;
  htmlContent: string;
};

export function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export function postLang(id: string): string {
  if (id.startsWith("es/")) return "es";
  if (id.startsWith("fr/")) return "fr";
  return "en";
}

export function blogListCacheKey(lang: string, sortOrder: string): string {
  return `blog-list:${lang}:${sortOrder}`;
}

export function blogPostCacheKey(lang: string, slug: string): string {
  return `blog-post:${lang}:${slug}`;
}

export function formatBlogCardDate(pubDate: string, lang: string): string {
  const locale =
    lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR";
  return new Date(pubDate).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBlogPostDate(pubDate: string, lang: string): string {
  const locale =
    lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR";
  return new Date(pubDate).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const ICON_ARROW_RIGHT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
