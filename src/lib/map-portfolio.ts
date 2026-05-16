import { resolveImageUrl } from "./images.ts";

export type PortfolioPostRow = {
  id: string;
  data: {
    title: string;
    description?: string;
    image?: string;
    meta?: {
      status?: string;
      category?: string;
      description?: string;
      link?: string;
    };
    pubDate?: Date;
    author?: string;
    tags?: string[];
  };
};

export function mapPortfolioProjects(rows: PortfolioPostRow[], lang: string) {
  return rows
    .filter((p) => {
      if (lang === "en") return !p.id.startsWith("es/") && !p.id.startsWith("fr/");
      return p.id.startsWith(`${lang}/`);
    })
    .map((p) => {
      const desc = p.data.description || "";
      const meta = p.data.meta;
      let status = meta?.status || "Published";
      let category = meta?.category || "Project";
      let cleanDesc = desc;

      if (!meta) {
        const statusMatch = desc.match(/(?:Status|Estado|Statut):\s*([^.]+)/i);
        if (statusMatch) {
          status = statusMatch[1].trim();
          cleanDesc = cleanDesc.replace(statusMatch[0], "");
        }
        const categoryMatch = desc.match(
          /(?:Category|Categoría|Catégorie|Categoria):\s*([^.]+)/i,
        );
        if (categoryMatch) {
          category = categoryMatch[1].trim();
          cleanDesc = cleanDesc.replace(categoryMatch[0], "");
        }
        cleanDesc = cleanDesc.replace(/^[.\s]+/, "");
      }

      const slug = p.id.split("/").pop()!;
      const externalLink = meta?.link || "";
      const isExternal = externalLink.startsWith("http");
      const link = isExternal ? externalLink : `/${lang}/projects/${slug}`;

      return {
        id: p.id,
        title: p.data.title,
        description: meta?.description || cleanDesc,
        titleKey: null as string | null,
        category,
        categoryKey: null as string | null,
        image: resolveImageUrl(p.data.image),
        status,
        statusKey: null as string | null,
        link,
        isExternal,
      };
    });
}
