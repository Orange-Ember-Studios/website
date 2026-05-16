import { getViteConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const cloudflareWorkersStub = fileURLToPath(
  new URL('./src/test/cloudflare-workers-stub.ts', import.meta.url),
);

export default getViteConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    server: {
      deps: {
        inline: ['@lucide/astro'],
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
