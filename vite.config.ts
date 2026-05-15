import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import type { IncomingMessage, ServerResponse } from "node:http";

export default defineConfig({
  envDir: ".",
  envPrefix: ["VITE_", "PUBLIC_"],
  define: {
    __PUBLIC_TURNSTILE_SITE_KEY__: JSON.stringify(process.env.PUBLIC_TURNSTILE_SITE_KEY || ""),
  },
  plugins: [
    emberkitVitePlugin(),
    tailwindcss(),
    {
      name: "orange-ember-api-dev",
      configureServer(server) {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
          const url = req.url ?? "";
          if (!url.startsWith("/api/")) {
            next();
            return;
          }
          try {
            const { handleApiRequestNode } = await import("./src/server/api-router.node");
            await handleApiRequestNode(req, res);
          } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("API error");
          }
        });
      },
    },
  ],
  server: {
    port: 4321,
    host: "localhost",
  },
  esbuild: {
    jsxImportSource: "@emberkit/core",
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
