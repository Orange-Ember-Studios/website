import { defineConfig, mergeConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { sqlTextPlugin } from "./vite.plugins.ts";

export default mergeConfig(
  defineConfig({
    plugins: [sqlTextPlugin(), tailwindcss()],
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
