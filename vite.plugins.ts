import tailwindcss from "@tailwindcss/vite";
import { emberkitVitePlugin, sqlRawPlugin } from "@emberkit/core/vite-plugin";

/** Vite plugins shared by EmberKit, Vitest, and CI shims. */
export const appVitePlugins = [sqlRawPlugin(), emberkitVitePlugin(), tailwindcss()];
