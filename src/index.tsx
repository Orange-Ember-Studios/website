import { hydrate, setCache } from "@emberkit/core";
import { routes } from "virtual:emberkit-routes";
import App from "./routes/_layout.tsx";
import "./styles/global.css";
import { getCurrentLanguage } from "./i18n/i18n.ts";
import { initPremiumSelects } from "./components/ui/premium-select-init.ts";

const root = document.getElementById("app");

async function init() {
  if (!root) return;

  try {
    hydrate(App, root, { routes, viewTransitions: true });

    requestAnimationFrame(() => {
      initPremiumSelects();
    });
  } catch (error) {
    console.error("[entry] Hydrate error:", error);
  }
}

void init();
