// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://orangeember.com',
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [vue(), mdx(), sitemap()],
  adapter: process.env.VITEST ? undefined : cloudflare(),
});