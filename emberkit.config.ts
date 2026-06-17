import { defineConfig } from "@emberkit/core";
import dotenv from "dotenv";
import { appVitePlugins } from "./vite.plugins.js";
import type { Plugin } from "vite";

dotenv.config({ path: ".env.local" });
dotenv.config();

function suppressEmberKitWarnings(): Plugin {
  return {
    name: "suppress-emberkit-warnings",
    enforce: "pre",
    config() {
      return {
        build: {
          rollupOptions: {
            onwarn(warning, warn) {
              const msg = warning.message;
              if (
                msg.includes("has been externalized for browser compatibility") ||
                msg.includes("is dynamically imported by virtual:emberkit-routes") ||
                msg.includes("never used in")
              ) {
                return;
              }
              warn(warning);
            },
          },
        },
      };
    },
  };
}

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
    plugins: [suppressEmberKitWarnings(), ...appVitePlugins],
    esbuild: {
      jsxImportSource: "@emberkit/core",
    },
    ssr: {
      noExternal: ["@emberkit/core"],
    },
  },
});
