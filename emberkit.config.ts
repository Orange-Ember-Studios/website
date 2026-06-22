import { defineConfig } from "@emberkit/core";
import dotenv from "dotenv";
import { appVitePlugins } from "./vite.plugins.js";
import { SITE_URLS } from "./src/constants/urls.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  mode: "ssr",
  devApi: {
    handler: "./src/server/api-router.node.ts",
    export: "handleApiRequestNode",
  },
  site: {
    url: SITE_URLS.BASE,
    name: "Orange Ember Studios",
    titleSuffix: " — Orange Ember Studios",
    description:
      "Premium game and app development studio. Create. Ignite. Play.",
    ogImage: `${SITE_URLS.BASE}/og-image.png`,
  },
  server: {
    port: 4321,
  },
  build: {
    target: "esnext",
  },
  vite: {
    envPrefix: ["VITE_", "PUBLIC_"],
    plugins: [...appVitePlugins],
    esbuild: {
      jsxImportSource: "@emberkit/core",
    },
  },
});
