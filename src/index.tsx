import { render, setCache } from "@emberkit/core";
import { routes } from "virtual:emberkit-routes";
import App from "./routes/_layout";
import "./styles/global.css";
import { getCurrentLanguage } from "./i18n/i18n";
import { initPremiumSelects } from "./components/ui/premium-select-init";

const root = document.getElementById("app");

async function init() {
  if (!root) return;

  // Preload critical content
  try {
    const lang = getCurrentLanguage();
    const portfolioPromise = fetch(`/api/portfolio/projects?lang=${encodeURIComponent(lang)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setCache(`portfolio:${lang}`, data));
    
    const blogPromise = fetch(`/api/blog/list?lang=${encodeURIComponent(lang)}&sort=desc`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setCache(`blog-list:${lang}:desc`, data));

    await Promise.allSettled([portfolioPromise, blogPromise]);
  } catch (e) {
    console.error("[entry] Preload error:", e);
  }

  try {
    render(App, root, { routes });
    
    // Initialize premium selects after rendering
    requestAnimationFrame(() => {
      initPremiumSelects();
    });
  } catch (error) {
    console.error("[entry] Render error:", error);
  }
}

void init();
