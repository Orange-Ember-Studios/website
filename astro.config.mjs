// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://orangeember.com',
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [vue(), sitemap()],
  adapter: process.env.VITEST ? undefined : cloudflare(),
});