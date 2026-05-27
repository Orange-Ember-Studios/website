import tailwindcss from "@tailwindcss/vite";
import {
  devApiPlugin,
  emberkitVitePlugin,
  sqlRawPlugin,
} from "@emberkit/core/vite-plugin";

/** Vite plugins shared by EmberKit, Vitest, and CI shims. */
export const appVitePlugins = [
  sqlRawPlugin(),
  devApiPlugin({
    handler: "./src/server/api-router.node.ts",
    export: "handleApiRequestNode",
  }),
  emberkitVitePlugin(),
  tailwindcss(),
];
