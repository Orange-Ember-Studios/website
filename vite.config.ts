import { defineConfig } from "vite";
import { appVitePlugins } from "./vite.plugins.ts";

/**
 * Ensures `virtual:emberkit-routes` resolves when `emberkit.config.ts`
 * cannot be loaded (e.g. some CI/Cloudflare environments).
 * Merged with emberkit.config.ts `vite` block by `emberkit build`.
 */
export default defineConfig({
  plugins: appVitePlugins,
  esbuild: {
    jsxImportSource: "@emberkit/core",
  },
});
