import { defineConfig } from "vite";
import { appVitePlugins } from "./vite.plugins.ts";

/**
 * CI / fallback when `emberkit.config.ts` cannot be loaded.
 * Dev server uses `emberkit.config.ts` only (no duplicate config file load).
 */
export default defineConfig({
  plugins: appVitePlugins,
  esbuild: {
    jsxImportSource: "@emberkit/core",
  },
});
