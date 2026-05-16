import { createEffect, createSignal, getCached, setCache } from "@emberkit/core";
import { IconExternalLink } from "@emberkit/icons";
import { getCurrentLanguage } from "../../i18n/i18n.ts";

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image: string;
  link: string;
  isExternal: boolean;
};

function portfolioCacheKey(lang: string) {
  return `portfolio:${lang}`;
}

/** EmberKit renders route HTML once; signal updates do not refresh JSX lists. */
function refreshCurrentRoute() {
  const url =
    window.location.pathname + window.location.search + window.location.hash;
  history.replaceState(null, "", url);
}

export function Portfolio(props: { lang?: string }) {
  const initialLang = props.lang || getCurrentLanguage();
  const initialCache =
    (getCached(portfolioCacheKey(initialLang)) as PortfolioProject[] | null) ??
    [];
  const [projects, setProjects] =
    createSignal<PortfolioProject[]>(initialCache);

  createEffect(() => {
    const l = props.lang || getCurrentLanguage();
    const cacheKey = portfolioCacheKey(l);

    void (async () => {
      let list = getCached(cacheKey) as PortfolioProject[] | null;
      const fetchedFromNetwork = list === null;
      if (list === null) {
        try {
          const res = await fetch(
            `/api/portfolio/projects?lang=${encodeURIComponent(l)}`,
          );
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = (await res.json()) as PortfolioProject[];
          list = Array.isArray(data) ? data : [];
        } catch (err) {
          console.error("[Portfolio] Fetch error:", err);
          list = [];
        }
        setCache(cacheKey, list);
      }

      setProjects(list);
      if (fetchedFromNetwork || (list.length > 0 && initialCache.length === 0)) {
        refreshCurrentRoute();
      }
    })();
  });

  return (
    <section
      id="portfolio"
      aria-label="Portfolio Gallery"
      className="py-24 bg-ash-950 text-white relative"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-void-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span data-i18n="portfolio.title">Our</span>
            <span
              data-i18n="portfolio.titleHighlight"
              className="text-transparent bg-clip-text bg-linear-to-r from-ember-400 to-ember-500"
            >
              Masterpieces
            </span>
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-ember-500 to-ember-700 mb-6 rounded-full" />
          <p
            data-i18n="portfolio.description"
            className="text-gray-400 max-w-2xl text-lg md:text-xl"
          >
            Explore a curated selection of our most ambitious desktop games, mobile
            experiences, and state-of-the-art web applications.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projects().map((project) => (
            <a
              key={project.id}
              href={project.link || "#"}
              target={project.isExternal ? "_blank" : "_self"}
              rel={project.isExternal ? "noopener noreferrer" : undefined}
              className={`group relative overflow-hidden rounded-2xl aspect-4/3 md:aspect-video bg-gray-900 shadow-2xl border border-white/5 transition-all duration-700 hover:border-ember-500/40 hover:shadow-[0_0_50px_rgba(255,91,13,0.15)] block ${!project.link ? "cursor-default" : "cursor-pointer"}`}
            >
              <img
                src={project.image}
                alt={`Project: ${project.title}`}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-60 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ash-950 via-ash-950/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
              <div className="absolute top-6 right-6">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg border backdrop-blur-md
              ${project.status === "Available Now" || project.status === "Early Access" ? "bg-green-500/20 text-green-300 border-green-500/30" : ""}
              ${project.status === "Coming Soon" || project.status === "Publishing" ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : ""}
              ${project.status === "In Development" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : ""}
            `}
                >
                  {project.status}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 p-8 lg:p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-ember-400 font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 flex items-center gap-2">
                  <span>{project.category}</span>
                  {project.isExternal ? (
                    <IconExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-500" />
                  ) : null}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {project.title}
                </h3>
                {project.description ? (
                  <p className="text-gray-400 text-sm md:text-base line-clamp-2 mt-3 group-hover:text-white transition-colors duration-500 delay-100 max-w-sm">
                    {project.description}
                  </p>
                ) : null}
              </div>
              <div className="absolute inset-0 border-[3px] border-ember-400/0 group-hover:border-ember-400/20 rounded-2xl transition-colors duration-700 pointer-events-none" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
