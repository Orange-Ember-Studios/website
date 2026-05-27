import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import type { Plugin } from "vite";

/** Import `.sql` as a string (matches Wrangler Text module rules). */
export function sqlTextPlugin(): Plugin {
  return {
    name: "sql-text",
    enforce: "pre",
    load(id) {
      if (!id.endsWith(".sql") || id.includes("?")) return;
      return `export default ${JSON.stringify(readFileSync(id, "utf-8"))}`;
    },
  };
}

/** Vite plugins shared by EmberKit, Vitest, and CI shims. */
export const appVitePlugins = [sqlTextPlugin(), emberkitVitePlugin(), tailwindcss()];
