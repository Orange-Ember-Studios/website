// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
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
  integrations: [vue(), mdx(), sitemap()],
  adapter: (process.env.NODE_ENV === "development" || process.env.VITEST) ? undefined : cloudflare(),
});
