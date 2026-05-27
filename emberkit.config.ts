import { defineConfig } from "@emberkit/core";
import dotenv from "dotenv";
import { appVitePlugins } from "./vite.plugins.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  mode: "ssr",
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
