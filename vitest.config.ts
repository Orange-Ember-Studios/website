import { defineConfig, mergeConfig, type UserConfig } from "vite";
import emberkitApp from "./emberkit.config.ts";

export default mergeConfig(
  emberkitApp.vite as UserConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      setupFiles: ["./vitest.setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      globals: true,
    },
  }),
);
