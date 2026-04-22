import { getViteConfig } from 'astro/config';

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
  },
});
