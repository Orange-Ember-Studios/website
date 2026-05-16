import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { emberkitVitePlugin } from '@emberkit/core/vite-plugin';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const cloudflareWorkersStub = fileURLToPath(
  new URL('./src/test/cloudflare-workers-stub.ts', import.meta.url),
);

export default defineConfig({
  plugins: [vue(), emberkitVitePlugin({ mode: 'spa' }), tailwindcss()],
  esbuild: {
    jsxImportSource: '@emberkit/core',
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      // Legacy Astro component tests — migrate to EmberKit/Vue or delete when .astro routes are removed
      'src/components/About/About.test.ts',
      'src/components/Services/Services.test.ts',
      'src/components/Hero/Hero.test.ts',
      'src/components/Portfolio/Portfolio.test.ts',
      'src/layouts/Layout.test.ts',
      'src/layouts/BlogLayout.test.ts',
      'src/components/Navigation/Navbar.test.ts',
      'src/pages/[lang]/privacy.test.ts',
      'src/middleware.test.ts',
    ],
    globals: true,
    server: {
      deps: {
        inline: [],
      },
    },
  },
  resolve: {
    conditions: ['node'],
    alias: {
      'cloudflare:workers': cloudflareWorkersStub,
    },
  },
});
