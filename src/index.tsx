import { render } from "@emberkit/core";
import { routes, notFoundRoute, errorRoute } from "virtual:emberkit-routes";
import App from "./routes/_layout.tsx";
import "./styles/global.css";
import { getCurrentLanguage } from "./i18n/i18n.ts";
import { initPremiumSelects } from "./components/ui/premium-select-init.ts";

const root = document.getElementById("app");

async function init() {
  if (!root) return;

  // Preload critical content into the client cache before hydration so
  // components don't refetch what the server already provided.
  try {
    const lang = getCurrentLanguage();
    const { setCache } = await import("@emberkit/core");

    const portfolioPromise = fetch(
      `/api/portfolio/projects?lang=${encodeURIComponent(lang)}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data !== null) {
          setCache(
            `portfolio:${lang}`,
            Array.isArray(data) ? data : [],
          );
        }
      });

    const blogPromise = fetch(
      `/api/blog/list?lang=${encodeURIComponent(lang)}&sort=desc`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data !== null) {
          setCache(
            `blog-list:${lang}:desc`,
            Array.isArray(data) ? data : [],
          );
        }
      });

    await Promise.allSettled([portfolioPromise, blogPromise]);
  } catch (e) {
    console.error("[entry] Preload error:", e);
  }

  try {
    render(App, root, { routes, notFoundRoute, errorRoute, viewTransitions: true });
    initPremiumSelects();
    root.classList.add("ee-ready");
  } catch (error) {
    console.error("[entry] Render error:", error);
  }
}

void init();
