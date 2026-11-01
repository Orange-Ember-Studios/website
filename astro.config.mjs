// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import { sqlTextPlugin } from './vite.plugins.ts';

export default defineConfig({
  output: 'server',
  site: 'https://orangeember.com',
  vite: {
    plugins: [sqlTextPlugin(), tailwindcss()],
    ssr: {
      noExternal: ['@lucide/astro', 'lucide-vue-next']
    }
  },
  // Nota: sin @astrojs/sitemap — en output server solo prerenderizaba / y /admin/login
  // (fuga de la ruta admin). El sitemap real es SSR: src/pages/sitemap.xml.ts
  integrations: [vue(), mdx()],
  adapter: (process.env.NODE_ENV === "development" || process.env.VITEST) ? undefined : cloudflare(),
});
