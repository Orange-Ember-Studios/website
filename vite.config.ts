import { defineConfig } from "vite";
import { appVitePlugins } from "./vite.plugins.ts";

/**
 * CI / Vitest fallback when the CLI loads vite.config directly.
 * Dev uses `emberkit.config.ts` only.
 */
export default defineConfig({
  plugins: appVitePlugins,
  esbuild: {
    jsxImportSource: "@emberkit/core",
  },
  build: {
    target: "esnext",
  },
});
