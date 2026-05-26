import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

type ApiRouterNode = typeof import("./src/server/api-router.node.ts");

/** Dev-only: proxy `/api/*` to the Node API router (migrations run on first API request). */
export function devApiPlugin(): Plugin {
  let routerModule: ApiRouterNode | null = null;

  return {
    name: "orange-ember-api-dev",
    configureServer(server) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next) => {
          const url = req.url ?? "";
          if (!url.startsWith("/api/")) {
            next();
            return;
          }
          try {
            routerModule ??= (await server.ssrLoadModule(
              "/src/server/api-router.node.ts",
            )) as ApiRouterNode;
            await routerModule.handleApiRequestNode(req, res);
          } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("API error");
          }
        },
      );
    },
  };
}
