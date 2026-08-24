<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import { getTranslation, getCurrentLanguage } from '@/i18n/i18n.ts';
import { resolveImageUrl } from '../../lib/images.ts';
import { getTagStyle } from './tagMetadata.ts';
import type { BlogListPost } from './blog-shared.ts';
import { blogListCacheKey, escHtml, formatBlogCardDate, postLang } from './blog-shared.ts';

const GRID_ROOT_ID = 'blog-index-grid';

const props = defineProps<{
  lang?: string;
}>();

const lang = computed(() => props.lang || getCurrentLanguage());
const sortOrder = ref('desc');
const loading = ref(true);
const posts = ref<BlogListPost[]>([]);

function getSortOrder(): string {
  if (typeof window === 'undefined') return 'desc';
  return new URLSearchParams(window.location.search).get('sort') || 'desc';
}

function getTagHtml(tags: string[]): string {
  return tags
    .slice(0, 3)
    .map(
      (tag) =>
        `<span class="${getTagStyle(tag)}"><span data-tag-id="${escHtml(tag)}">${escHtml(tag)}</span></span>`,
    )
    .join('');
}

function renderPostCard(post: BlogListPost, postLang: string, readStory: string): string {
  const slugForHref = post.id.replace(`${postLang}/`, '');
  const href = `/${lang.value}/blog/${encodeURIComponent(slugForHref)}`;
  const tags = post.data.tags?.length
    ? post.data.tags
    : post.data.meta?.tags || [];
  const dateStr = formatBlogCardDate(post.data.pubDate, lang.value);
  const tagHtml = getTagHtml(tags);
  const imageBlock = post.data.image
    ? `<div class="aspect-16/10 overflow-hidden"><img src="${escHtml(resolveImageUrl(post.data.image))}" alt="${escHtml(post.data.title)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /></div>`
    : '';

  return `<a href="${href}" class="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(249,115,22,0.2)] block">${imageBlock}<div class="p-8"><div class="flex flex-wrap items-center gap-2 mb-4">${tagHtml}<span class="text-xs text-gray-500 ml-auto">${escHtml(dateStr)}</span></div><h2 class="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-orange-400 transition-colors">${escHtml(post.data.title)}</h2><p class="text-gray-400 line-clamp-3 mb-6 text-sm leading-relaxed">${escHtml(post.data.description)}</p><div class="flex items-center text-white font-bold text-sm group-hover:translate-x-1 transition-transform"><span>${escHtml(readStory)}</span><svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></div></div></a>`;
}

function renderGrid(postsToRender: BlogListPost[]) {
  const root = document.getElementById(GRID_ROOT_ID);
  if (!root) return;

  if (postsToRender.length === 0) {
    root.innerHTML = `<p class="text-center text-gray-500 col-span-full py-16 text-lg">${escHtml(getTranslation('blog.indexDescription', lang.value))}</p>`;
    return;
  }

  root.innerHTML = postsToRender
    .map((post) => renderPostCard(post, postLang(post.id), getTranslation('blog.readStory', lang.value)))
    .join('');
}

onMounted(async () => {
  sortOrder.value = getSortOrder();
  const cacheKey = blogListCacheKey(lang.value, sortOrder.value);
  let list: BlogListPost[] | null = null;

  // Try cache first
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      list = JSON.parse(cached) as BlogListPost[];
      posts.value = list;
      loading.value = false;
      renderGrid(list);
    }
  } catch {
    list = null;
  }

  // Fetch from network
  try {
    const res = await fetch(
      `/api/blog/list?lang=${encodeURIComponent(lang.value)}&sort=${encodeURIComponent(sortOrder.value)}`,
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = (await res.json()) as BlogListPost[];
    list = Array.isArray(data) ? data : [];
    posts.value = list;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(list));
    } catch {
      // sessionStorage not available
    }
  } catch (err) {
    console.error('[BlogIndex] Fetch error:', err);
    if (list === null) {
      posts.value = [];
    }
  }

  loading.value = false;
  renderGrid(posts.value);
});
</script>

<template>
  <main class="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <header class="mb-20 text-center">
      <h1 class="text-5xl sm:text-7xl font-extrabold text-white mb-6 tracking-tight">
        <span data-i18n="blog.indexTitlePrefix">
          {{ getTranslation('blog.indexTitlePrefix', lang) }}
        </span>
        <span
          class="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600"
          data-i18n="blog.indexTitleHighlight"
        >
          {{ getTranslation('blog.indexTitleHighlight', lang) }}
        </span>
        <span data-i18n="blog.indexTitleSuffix">
          {{ getTranslation('blog.indexTitleSuffix', lang) }}
        </span>
      </h1>
      <p
        class="text-xl text-gray-400 max-w-2xl mx-auto"
        data-i18n="blog.indexDescription"
      >
        {{ getTranslation('blog.indexDescription', lang) }}
      </p>
    </header>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="i in 3" :key="i" class="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden animate-pulse">
        <div class="aspect-16/10 bg-white/10" />
        <div class="p-8 space-y-4">
          <div class="h-4 w-24 bg-white/10 rounded" />
          <div class="h-8 w-full bg-white/10 rounded" />
          <div class="h-16 w-full bg-white/10 rounded" />
        </div>
      </div>
    </div>

    <div
      id="blog-index-grid"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    />
  </main>
</template>
