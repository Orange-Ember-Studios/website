import { render, setCache } from "@emberkit/core";
import { routes } from "virtual:emberkit-routes";
import App from "./routes/_layout.tsx";
import "./styles/global.css";
import { getCurrentLanguage } from "./i18n/i18n.ts";
import { initPremiumSelects } from "./components/ui/premium-select-init.ts";

const root = document.getElementById("app");

async function init() {
  if (!root) return;

  // Preload critical content
  try {
    const lang = getCurrentLanguage();
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
    render(App, root, { routes, viewTransitions: true });

    // Remove the initial loader once EmberKit has rendered
    requestAnimationFrame(() => {
      const loader = document.getElementById("oe-loader");
      if (loader) {
        loader.classList.add("fade-out");
        loader.addEventListener("transitionend", () => loader.remove(), {
          once: true,
        });
      }
      initPremiumSelects();
    });
  } catch (error) {
    console.error("[entry] Render error:", error);
  }
}

void init();
