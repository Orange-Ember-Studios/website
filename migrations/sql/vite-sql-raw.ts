import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/** Bundles `*.sql?raw` imports as string literals (Workers have no filesystem). */
export function sqlRawPlugin(): Plugin {
  return {
    name: "orange-ember-sql-raw",
    enforce: "pre",
    load(id) {
      if (!id.endsWith(".sql?raw")) return;
      const filePath = id.slice(0, -"?raw".length);
      const sql = readFileSync(filePath, "utf-8");
      return {
        code: `export default ${JSON.stringify(sql)}`,
        map: null,
      };
    },
  };
}
