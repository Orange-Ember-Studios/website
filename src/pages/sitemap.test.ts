/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

import { buildSitemapEntries, type SitemapPost } from "../pages/sitemap.xml";

const enPost: SitemapPost = {
  id: "hello-ember",
  slug: "hello-ember",
  data: { pubDate: new Date("2026-08-01T00:00:00Z") },
};
const esPost: SitemapPost = {
  id: "es/hola-ember",
  slug: "hola-ember",
  data: { pubDate: new Date("2026-09-15T00:00:00Z") },
};
const frPost: SitemapPost = {
  id: "fr/bonjour-ember",
  slug: "bonjour-ember",
};

const projectPosts: SitemapPost[] = [
  { id: "ember-roll", slug: "ember-roll" },
  { id: "es/ember-roll", slug: "ember-roll" },
];

describe("buildSitemapEntries", () => {
  it("incluye las rutas estáticas por idioma sin lastmod", () => {
    const entries = buildSitemapEntries([], []);
    for (const lang of ["en", "es", "fr"]) {
      expect(entries).toContainEqual({ loc: `https://orangeember.com/${lang}/` });
      expect(entries).toContainEqual({ loc: `https://orangeember.com/${lang}/blog` });
      expect(entries).toContainEqual({ loc: `https://orangeember.com/${lang}/privacy` });
    }
    expect(entries.every((e) => e.lastmod === undefined)).toBe(true);
  });

  it("mapea slugs de blog por idioma con lastmod = pubDate (AAA-MM-DD)", () => {
    const entries = buildSitemapEntries([enPost, esPost, frPost], projectPosts);
    expect(entries).toContainEqual({
      loc: "https://orangeember.com/en/blog/hello-ember",
      lastmod: "2026-08-01",
    });
    expect(entries).toContainEqual({
      loc: "https://orangeember.com/es/blog/hola-ember",
      lastmod: "2026-09-15",
    });
    // frPost sin fecha: va sin lastmod
    expect(entries).toContainEqual({ loc: "https://orangeember.com/fr/blog/bonjour-ember" });
  });

  it("no mezcla idiomas: un visto en es no aparece en en y viceversa", () => {
    const entries = buildSitemapEntries([enPost, esPost], projectPosts);
    expect(entries.some((e) => e.loc.includes("/en/blog/hola-ember"))).toBe(false);
    expect(entries.some((e) => e.loc.includes("/es/blog/hello-ember"))).toBe(false);
  });

  it("excluye fichas de proyecto (la vista /<lang>/projects/<slug> no existe hoy)", () => {
    const entries = buildSitemapEntries([enPost], projectPosts);
    expect(entries.some((e) => e.loc.includes("/projects/"))).toBe(false);
  });
});
