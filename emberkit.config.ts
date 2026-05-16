import { defineConfig } from "@emberkit/core";
import { emberkitVitePlugin } from "@emberkit/core/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  mode: "spa",
  server: {
    port: 5173,
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
      __PUBLIC_TURNSTILE_SITE_KEY__: JSON.stringify(
        process.env.PUBLIC_TURNSTILE_SITE_KEY ?? "",
      ),
    },
    plugins: [vue(), emberkitVitePlugin(), tailwindcss()],
    esbuild: {
      jsxImportSource: "@emberkit/core",
    },
    ssr: {
      noExternal: ["lucide-vue-next"],
    },
  },
});
