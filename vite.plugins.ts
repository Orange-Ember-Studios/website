import tailwindcss from "@tailwindcss/vite";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import { sqlRawPlugin } from "./migrations/sql/vite-sql-raw.ts";
import { devApiPlugin } from "./vite.dev-api-plugin.ts";

/** Vite plugins shared by EmberKit, Vitest, and CI shims. */
export const appVitePlugins = [
  sqlRawPlugin(),
  devApiPlugin(),
  emberkitVitePlugin(),
  tailwindcss(),
];
