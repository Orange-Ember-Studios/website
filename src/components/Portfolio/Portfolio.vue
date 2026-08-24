<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ExternalLink } from 'lucide-vue-next';
import { getTranslation, getCurrentLanguage } from '@/i18n/i18n.ts';

const props = defineProps<{
  lang?: string;
}>();

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image: string;
  link: string;
  isExternal: boolean;
}

function portfolioCacheKey(lang: string) {
  return `portfolio:${lang}`;
}

const initialLang = computed(() => props.lang || getCurrentLanguage());
const portfolioLang = computed(() => initialLang.value as 'en' | 'es' | 'fr');
const cachedProjects = ref<PortfolioProject[]>([]);
const loading = ref(true);

const initiallyLoading = computed(() => cachedProjects.value.length === 0);

onMounted(async () => {
  const cacheKey = portfolioCacheKey(initialLang.value);
  let list: PortfolioProject[] | null = null;

  try {
    list = JSON.parse(sessionStorage.getItem(cacheKey) || 'null') as PortfolioProject[] | null;
  } catch {
    list = null;
  }

  if (list === null) {
    try {
      const res = await fetch(
        `/api/portfolio/projects?lang=${encodeURIComponent(initialLang.value)}`,
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = (await res.json()) as PortfolioProject[];
      list = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('[Portfolio] Fetch error:', err);
      list = [];
    }
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(list));
    } catch {
      // sessionStorage not available
    }
  }

  cachedProjects.value = list;
  loading.value = false;
});

function getStatusStyles(status: string): string {
  if (status === 'Available Now' || status === 'Early Access') {
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  }
  if (status === 'Coming Soon' || status === 'Publishing') {
    return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  }
  if (status === 'In Development') {
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }
  return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
}
</script>

<template>
  <section
    id="portfolio"
    aria-label="Portfolio Gallery"
    class="py-24 bg-ash-950 text-white relative"
  >
    <div class="absolute top-0 right-0 w-96 h-96 bg-void-500/10 rounded-full blur-[100px] pointer-events-none" />
    <div class="max-w-7xl mx-auto px-6 relative z-10">
      <div class="mb-16">
        <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          <span>{{ getTranslation('portfolio.title', portfolioLang) }}</span>
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-ember-400 to-ember-500"
          >
            {{ getTranslation('portfolio.titleHighlight', portfolioLang) }}
          </span>
        </h2>
        <div class="w-24 h-1 bg-linear-to-r from-ember-500 to-ember-700 mb-6 rounded-full" />
        <p
          class="text-gray-400 max-w-2xl text-lg md:text-xl"
        >
          {{ getTranslation('portfolio.description', portfolioLang) }}
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div v-for="i in 4" :key="i" class="relative overflow-hidden rounded-2xl aspect-4/3 md:aspect-video bg-gray-900/60 border border-white/5 shadow-2xl animate-pulse">
          <div class="absolute inset-0 bg-white/5" />
          <div class="absolute top-6 right-6 h-6 w-24 rounded-full bg-white/10" />
          <div class="absolute bottom-0 left-0 right-0 p-8 lg:p-10 space-y-3">
            <div class="h-3 w-20 rounded bg-white/10" />
            <div class="h-8 w-3/4 rounded bg-white/10" />
            <div class="h-4 w-full rounded bg-white/10" />
            <div class="h-4 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      </div>

      <div v-else-if="cachedProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <a
          v-for="project in cachedProjects"
          :key="project.id"
          :href="project.link || '#'"
          :target="project.isExternal ? '_blank' : '_self'"
          :rel="project.isExternal ? 'noopener noreferrer' : undefined"
          class="group relative overflow-hidden rounded-2xl aspect-4/3 md:aspect-video bg-gray-900 shadow-2xl border border-white/5 transition-all duration-700 hover:border-ember-500/40 hover:shadow-[0_0_50px_rgba(255,91,13,0.15)] block"
          :class="{ 'cursor-default': !project.link, 'cursor-pointer': !!project.link }"
        >
          <img
            :src="project.image"
            :alt="`Project: ${project.title}`"
            class="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-60 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
          />
          <div class="absolute inset-0 bg-linear-to-t from-ash-950 via-ash-950/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
          <div class="absolute top-6 right-6">
            <span
              class="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg border backdrop-blur-md"
              :class="getStatusStyles(project.status)"
            >
              {{ project.status }}
            </span>
          </div>
          <div class="absolute bottom-0 left-0 p-8 lg:p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <span class="text-ember-400 font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 flex items-center gap-2">
              <span>{{ project.category }}</span>
              <ExternalLink
                v-if="project.isExternal"
                class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-500"
              />
            </span>
            <h3 class="text-3xl md:text-4xl font-bold text-white mb-2">
              {{ project.title }}
            </h3>
            <p
              v-if="project.description"
              class="text-gray-400 text-sm md:text-base line-clamp-2 mt-3 group-hover:text-white transition-colors duration-500 delay-100 max-w-sm"
            >
              {{ project.description }}
            </p>
          </div>
          <div class="absolute inset-0 border-[3px] border-ember-400/0 group-hover:border-ember-400/20 rounded-2xl transition-colors duration-700 pointer-events-none" />
        </a>
      </div>
      <div v-else class="text-center py-16">
        <p class="text-gray-500 text-lg">No projects yet. Check back soon!</p>
      </div>
    </div>
  </section>
</template>
