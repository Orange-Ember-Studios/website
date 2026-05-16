import { defineConfig } from "vite";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

/**
 * Ensures `virtual:emberkit-routes` resolves when `emberkit.config.ts`
 * cannot be loaded (e.g. some CI/Cloudflare environments).
 * Merged with emberkit.config.ts `vite` block by `emberkit build`.
 */
export default defineConfig({
  plugins: [emberkitVitePlugin(), tailwindcss()],
  esbuild: {
    jsxImportSource: "@emberkit/core",
  },
});
