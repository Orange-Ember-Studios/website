<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { ChevronLeft, Clock, Heart, MessageCircle, Share2, X } from 'lucide-vue-next';
import { getTranslation } from '@/i18n/i18n.ts';
import type { SupportedLanguage } from '../../i18n/i18n.ts';
import { getTagStyle } from './tagMetadata.ts';
import { resolveImageUrl } from '../../lib/images.ts';
import { SITE_URLS, SOCIAL_URLS } from '../../constants/urls.ts';
import { SUPPORTED_LANGS } from '../../server/site-env.ts';
import type { BlogPostPayload } from './blog-shared.ts';
import { blogPostCacheKey, formatBlogPostDate } from './blog-shared.ts';

const props = defineProps<{
  lang: string;
  slug: string;
}>();

interface ArticleSchema {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  url: string;
  image?: string;
}

function generateArticleSchema(data: ArticleSchema): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    author: { '@type': 'Person', name: data.author },
    datePublished: data.publishedAt,
    url: data.url,
    image: data.image,
  });
}

function refreshCurrentRoute() {
  const url = window.location.pathname + window.location.search + window.location.hash;
  window.location.href = url;
}

const loading = ref(true);
const post = ref<BlogPostPayload | null>(null);

const cacheKey = computed(() => blogPostCacheKey(props.lang, props.slug));
const langKey = computed(() => props.lang as SupportedLanguage);

onMounted(async () => {
  if (!(SUPPORTED_LANGS as readonly string[]).includes(props.lang)) {
    window.location.href = '/404';
    return;
  }

  let cached: BlogPostPayload | null = null;
  try {
    const stored = sessionStorage.getItem(cacheKey.value);
    if (stored) {
      cached = JSON.parse(stored) as BlogPostPayload;
    }
  } catch {
    cached = null;
  }

  if (cached) {
    post.value = cached;
    loading.value = false;
  }

  try {
    const res = await fetch(
      `/api/blog/${encodeURIComponent(props.lang)}/${encodeURIComponent(props.slug)}`,
    );
    if (!res.ok) {
      window.location.href = '/404';
      return;
    }
    const data = (await res.json()) as BlogPostPayload;
    post.value = data;
    try {
      sessionStorage.setItem(cacheKey.value, JSON.stringify(data));
    } catch {
      // sessionStorage not available
    }
  } catch (err) {
    console.error('[BlogPost] Fetch error:', err);
    window.location.href = '/404';
    return;
  }

  loading.value = false;

  if (cached) {
    refreshCurrentRoute();
  }
});

const formattedDate = computed(() => {
  if (!post.value) return '';
  return formatBlogPostDate(post.value.frontmatter.pubDate, props.lang);
});

const shareLinks = computed(() => {
  if (!post.value) return { x: '', linkedin: '', whatsapp: '' };
  const title = post.value.frontmatter.title;
  const postUrl = new URL(`/${props.lang}/blog/${props.slug}`, SITE_URLS.BASE).toString();
  const encodedPostUrl = encodeURIComponent(postUrl);
  const encodedShareText = encodeURIComponent(title);
  return {
    x: `https://x.com/intent/tweet?url=${encodedPostUrl}&text=${encodedShareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostUrl}`,
    whatsapp: `https://wa.me/?text=${encodedShareText}%20${encodedPostUrl}`,
  };
});

const likeEndpoint = computed(() => {
  return `/api/posts/${encodeURIComponent(props.lang)}/${encodeURIComponent(props.slug)}/likes`;
});

const schemaJson = computed(() => {
  if (!post.value) return '';
  const { frontmatter, readingTime: _readingTime } = post.value;
  const resolvedImage = resolveImageUrl(frontmatter.image);
  const postUrl = new URL(`/${props.lang}/blog/${props.slug}`, SITE_URLS.BASE).toString();
  return generateArticleSchema({
    title: frontmatter.title,
    description: frontmatter.description || '',
    author: frontmatter.author || 'Orange Ember',
    publishedAt: new Date(frontmatter.pubDate).toISOString(),
    url: postUrl,
    image: resolvedImage,
  });
});

async function handleLike(btn: HTMLButtonElement) {
  if (btn.disabled) return;

  const previousDisabled = btn.disabled;
  btn.disabled = true;

  try {
    const response = await fetch(likeEndpoint.value, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Like request failed (${response.status})`);
    }
    const payload = await response.json() as { count: number; liked: boolean };

    const countEl = btn.querySelector('[data-like-count]');
    const labelEl = btn.querySelector('[data-like-label]');
    const iconEl = btn.querySelector('[data-like-icon]');

    if (countEl) countEl.textContent = String(payload.count);
    if (labelEl) labelEl.textContent = payload.liked
      ? getTranslation('post.liked', langKey.value)
      : getTranslation('post.like', langKey.value);

    btn.disabled = payload.liked;
    btn.setAttribute('aria-pressed', payload.liked ? 'true' : 'false');

    btn.classList.toggle('bg-orange-500', payload.liked);
    btn.classList.toggle('text-white', payload.liked);
    btn.classList.toggle('bg-orange-500/10', !payload.liked);
    btn.classList.toggle('text-orange-100', !payload.liked);
    btn.classList.toggle('hover:bg-orange-500', !payload.liked);
    btn.classList.toggle('hover:text-white', !payload.liked);

    if (iconEl) iconEl.classList.toggle('fill-current', payload.liked);
  } catch (error) {
    console.error('[like] POST error:', error);
    btn.disabled = previousDisabled;
  }
}

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const btn = document.getElementById('blog-like-btn') as HTMLButtonElement | null;
  if (!btn) return;

  if (btn.dataset.likeWired === 'true') return;
  btn.dataset.likeWired = 'true';

  // Initial fetch to get like status
  try {
    const response = await fetch(likeEndpoint.value, { credentials: 'include' });
    if (response.ok) {
      const payload = await response.json() as { count: number; liked: boolean };
      const countEl = btn.querySelector('[data-like-count]');
      const labelEl = btn.querySelector('[data-like-label]');
      const iconEl = btn.querySelector('[data-like-icon]');

      if (countEl) countEl.textContent = String(payload.count);
      if (labelEl) labelEl.textContent = payload.liked
        ? getTranslation('post.liked', langKey.value)
        : getTranslation('post.like', langKey.value);

      btn.disabled = payload.liked;
      btn.setAttribute('aria-pressed', payload.liked ? 'true' : 'false');

      btn.classList.toggle('bg-orange-500', payload.liked);
      btn.classList.toggle('text-white', payload.liked);
      btn.classList.toggle('bg-orange-500/10', !payload.liked);
      btn.classList.toggle('text-orange-100', !payload.liked);
      btn.classList.toggle('hover:bg-orange-500', !payload.liked);
      btn.classList.toggle('hover:text-white', !payload.liked);

      if (iconEl) iconEl.classList.toggle('fill-current', payload.liked);
    }
  } catch (error) {
    console.error('[like] Initial fetch error:', error);
  }

  btn.addEventListener('click', () => handleLike(btn));
});
</script>

<template>
  <div>
    <title>{{ post?.frontmatter.title }} | Orange Ember Blog</title>
    <script type="application/ld+json" v-html="schemaJson" />

    <main v-if="loading" class="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-pulse">
      <div class="h-6 w-32 bg-white/10 rounded mb-8" />
      <div class="h-16 w-full bg-white/10 rounded mb-8" />
      <div class="h-6 w-64 bg-white/10 rounded mb-12" />
      <div class="aspect-21/9 bg-white/10 rounded-4xl mb-16" />
      <div class="space-y-4">
        <div class="h-4 w-full bg-white/10 rounded" />
        <div class="h-4 w-full bg-white/10 rounded" />
        <div class="h-4 w-3/4 bg-white/10 rounded" />
      </div>
    </main>

    <main v-else-if="post" class="blog-post pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div class="mb-8">
        <a
          :href="`/${lang}/blog`"
          class="inline-flex items-center text-orange-500 hover:text-orange-400 font-medium transition-colors duration-200 group"
        >
          <ChevronLeft class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          <span data-i18n="post.backToBlog">
            {{ getTranslation('post.backToBlog', langKey) }}
          </span>
        </a>
      </div>

      <header class="mb-12 animate-fade-in">
        <div v-if="post.frontmatter.tags?.length" class="flex flex-wrap gap-2 mb-6">
          <span
            v-for="tag in post.frontmatter.tags"
            :key="tag"
            :class="getTagStyle(tag)"
          >
            {{ tag }}
          </span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-extrabold text-white mb-8 leading-tight tracking-tight">
          {{ post.frontmatter.title }}
        </h1>

        <div class="flex items-center space-x-6 text-gray-400">
          <div class="flex items-center">
            <div class="h-12 w-12 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold mr-4 shadow-xl shadow-orange-500/20 rotate-3">
              {{ post.frontmatter.author?.charAt(0) || 'O' }}
            </div>
            <div>
              <p class="text-gray-100 font-semibold">{{ post.frontmatter.author || 'Orange Ember' }}</p>
              <p class="text-sm">{{ formattedDate }}</p>
            </div>
          </div>
          <div class="h-8 w-px bg-white/10 hidden sm:block" />
          <div class="hidden sm:flex items-center text-sm font-medium">
            <Clock class="h-5 w-5 mr-2 text-orange-500" />
            <span>
              {{ getTranslation('post.estReadTime', langKey).replace('{time}', post.readingTime.toString()) }}
            </span>
          </div>
        </div>
      </header>

      <div v-if="post.frontmatter.image" class="relative w-full aspect-21/9 rounded-4xl overflow-hidden mb-16 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] ring-1 ring-white/10">
        <img
          :src="resolveImageUrl(post.frontmatter.image)"
          :alt="post.frontmatter.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-transparent to-transparent opacity-60" />
      </div>

      <article
        class="blog-content prose-premium"
        v-html="post.htmlContent"
      />

      <section
        class="mt-12 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
        :aria-label="getTranslation('post.actions', langKey)"
      >
        <button
          id="blog-like-btn"
          type="button"
          :data-like-endpoint="likeEndpoint"
          :data-like-label="getTranslation('post.like', langKey)"
          :data-liked-label="getTranslation('post.liked', langKey)"
          class="group inline-flex items-center justify-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 font-bold text-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white disabled:cursor-default disabled:hover:translate-y-0"
          aria-pressed="false"
        >
          <Heart
            class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
            data-like-icon
            aria-hidden="true"
          />
          <span data-like-label>
            {{ getTranslation('post.like', langKey) }}
          </span>
          <span
            class="rounded-full bg-white/10 px-2.5 py-1 text-sm"
            data-like-count
          >
            0
          </span>
        </button>

        <div class="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
          <span class="inline-flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Share2 class="h-4 w-4 text-orange-400" aria-hidden="true" />
            {{ getTranslation('post.share', langKey) }}
          </span>
          <a
            :href="shareLinks.x"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="getTranslation('post.shareX', langKey)"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            :href="shareLinks.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="getTranslation('post.shareLinkedIn', langKey)"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
          >
            <span class="font-bold leading-none" aria-hidden="true">in</span>
          </a>
          <a
            :href="shareLinks.whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="getTranslation('post.shareWhatsApp', langKey)"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
          >
            <MessageCircle class="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer class="mt-20 pt-10 border-t border-white/5">
        <div class="bg-linear-to-br from-white/5 to-transparent rounded-4xl p-8 sm:p-12 border border-white/10">
          <div class="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3
                class="text-2xl font-bold text-white mb-2"
                data-i18n="post.enjoyedPost"
              >
                {{ getTranslation('post.enjoyedPost', langKey) }}
              </h3>
              <p class="text-gray-400" data-i18n="post.stayUpdated">
                {{ getTranslation('post.stayUpdated', langKey) }}
              </p>
            </div>
            <div class="flex gap-4">
              <a
                :href="SOCIAL_URLS.TWITTER_X"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-orange-500 hover:text-white transition-all duration-300"
              >
                <span data-i18n="post.followX">
                  {{ getTranslation('post.followX', langKey) }}
                </span>
                <X class="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>
