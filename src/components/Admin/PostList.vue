<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FileText, Pencil, Plus } from 'lucide-vue-next';

interface Post {
  id: string;
  slug: string;
  type: 'blog' | 'project' | 'case_study';
  author: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

const props = defineProps<{
  postType: 'blog' | 'project' | 'case_study';
  section: string;
}>();

const SECTION_LABELS: Record<string, string> = {
  blog: 'Blog Post',
  project: 'Project',
  case_study: 'Case Study',
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const label = computed(() => SECTION_LABELS[props.section] ?? props.section);
const labelLower = computed(() => label.value.toLowerCase());

const loading = ref(true);
const loadError = ref('');
const posts = ref<Post[]>([]);

function editHref(post: Post): string {
  return `/admin/${encodeURIComponent(props.section)}/${encodeURIComponent(post.id)}`;
}

const newHref = computed(() => `/admin/${encodeURIComponent(props.section)}/new`);

async function loadPosts() {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await fetch(
      `/api/admin/posts?type=${encodeURIComponent(props.postType)}`,
      { credentials: 'include' },
    );
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    if (!res.ok) {
      loadError.value = `Could not load ${labelLower.value}s (${res.status}).`;
      posts.value = [];
      return;
    }
    const data = (await res.json()) as Post[];
    posts.value = Array.isArray(data)
      ? data.filter((p) => String(p.type ?? '').trim() === props.postType)
      : [];
  } catch {
    loadError.value = `Network error while loading ${labelLower.value}s.`;
    posts.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadPosts);
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-white">
        {{ label }}s
      </h2>
      <a
        :href="newHref"
        class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
      >
        <Plus class="w-4 h-4" />
        New {{ label }}
      </a>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-neutral-900 border border-neutral-800 rounded-xl p-5 animate-pulse flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div class="h-5 w-20 bg-neutral-800 rounded-md" />
          <div class="h-4 w-24 bg-neutral-800 rounded-md" />
        </div>
        <div class="h-5 w-3/4 bg-neutral-800 rounded-md" />
        <div class="h-4 w-1/3 bg-neutral-800 rounded-md mt-auto" />
      </div>
    </div>

    <div
      v-else-if="loadError"
      class="flex flex-col items-center justify-center py-16 border border-red-500/30 bg-red-500/5 rounded-2xl text-center px-4"
    >
      <p class="text-red-400 text-sm mb-4">{{ loadError }}</p>
      <button
        type="button"
        @click="loadPosts"
        class="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="posts.length === 0"
      class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-700 rounded-2xl text-center px-4"
    >
      <FileText class="w-12 h-12 text-neutral-600 mb-4" />
      <p class="text-neutral-500 mb-1 text-base font-medium">
        No {{ labelLower }}s yet
      </p>
      <p class="text-neutral-400 text-sm mb-5">
        Create your first {{ labelLower }} to get started.
      </p>
      <a
        :href="newHref"
        class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
      >
        Create {{ label }}
      </a>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <a
        v-for="post in posts"
        :key="post.id"
        :href="editHref(post)"
        class="bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/40 transition-colors p-5 flex flex-col gap-3 group cursor-pointer"
      >
        <div class="flex justify-between items-start">
          <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-orange-500/10 text-orange-400">
            {{ label }}
          </span>
          <span class="text-xs text-neutral-400">
            {{ formatDate(post.created_at) }}
          </span>
        </div>
        <h3 class="text-base font-medium text-neutral-200 line-clamp-2 group-hover:text-orange-400 transition-colors">
          {{ post.slug }}
        </h3>
        <div class="flex items-center gap-2 mt-auto pt-2 border-t border-neutral-800 text-xs text-neutral-500 group-hover:text-orange-400 transition-colors">
          <Pencil class="w-3.5 h-3.5" />
          <span>Edit</span>
        </div>
      </a>
    </div>
  </div>
</template>
