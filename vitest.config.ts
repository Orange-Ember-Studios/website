import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { sqlTextPlugin } from "./vite.plugins.ts";

export default mergeConfig(
  defineConfig({
    plugins: [sqlTextPlugin(), tailwindcss(), vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  }),
  defineConfig({
    test: {
      environment: "happy-dom",
      setupFiles: ["./vitest.setup.ts"],
      include: ["src/**/*.test.{ts,tsx}", "migrations/**/*.test.ts"],
      globals: true,
    },
  }),
);
