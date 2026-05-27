import { defineConfig } from "@emberkit/core";
import dotenv from "dotenv";
import { appVitePlugins } from "./vite.plugins.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  mode: "ssr",
  devApi: {
    handler: "./src/server/api-router.node.ts",
    export: "handleApiRequestNode",
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
