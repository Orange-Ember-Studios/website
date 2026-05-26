import { defineConfig, mergeConfig, type UserConfig } from "vite";
import { appVitePlugins } from "./vite.plugins.ts";

export default mergeConfig(
  defineConfig({
    plugins: appVitePlugins,
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
