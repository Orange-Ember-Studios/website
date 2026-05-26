import tailwindcss from "@tailwindcss/vite";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import { sqlRawPlugin } from "./migrations/sql/vite-sql-raw.ts";

/** Vite plugins shared by EmberKit, Vitest, and CI shims (no dev-only API middleware). */
export const appVitePlugins = [sqlRawPlugin(), emberkitVitePlugin(), tailwindcss()];
