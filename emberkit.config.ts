import { defineConfig } from "@emberkit/core";
import tailwindcss from "@tailwindcss/vite";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import type { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  mode: "ssr",
  server: {
    port: 4321,
    host: "localhost",
  },
  build: {
    outDir: "dist",
    target: "esnext",
  },
  vite: {
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
          const runMigrationsWhenListening = () => {
            import("./src/lib/db-migrations.ts")
              .then(({ ensureDatabaseSchema }) =>
                ensureDatabaseSchema({
                  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? "",
                  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? "",
                }),
              )
              .then(() => console.log("[db] migrations ready (dev server)"))
              .catch((e) => console.error("[db] migrations failed (dev server)", e));
          };
          if (server.httpServer?.listening) {
            runMigrationsWhenListening();
          } else {
            server.httpServer?.once("listening", runMigrationsWhenListening);
          }

          server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
            const url = req.url ?? "";
            if (!url.startsWith("/api/")) {
              next();
              return;
            }
            try {
              const { handleApiRequestNode } = await import("./src/server/api-router.node.ts");
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
    esbuild: {
      jsxImportSource: "@emberkit/core",
    },
    build: {
      rollupOptions: {
        input: {
          main: "./index.html",
        },
      },
    },
  },
});
