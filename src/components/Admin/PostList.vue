<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus } from 'lucide-vue-next';

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
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

const label = computed(() => SECTION_LABELS[props.section] ?? props.section);
const rootId = computed(() => `postlist-grid-${props.section}`);

const loading = ref(true);
const posts = ref<Post[]>([]);

onMounted(async () => {
  try {
    const res = await fetch(
      `/api/admin/posts?type=${encodeURIComponent(props.postType)}`,
      {
        credentials: 'include',
      },
    );
    if (!res.ok) {
      console.error('PostList: failed to fetch posts', res.status);
      posts.value = [];
      return;
    }
    const data: Post[] = await res.json();
    posts.value = Array.isArray(data)
      ? data.filter((p) => String(p.type ?? '').trim() === props.postType)
      : [];
  } catch (e) {
    console.error('PostList: error fetching posts', e);
    posts.value = [];
  } finally {
    loading.value = false;
  }
});

function renderPosts() {
  const root = document.getElementById(rootId.value);
  if (!root) return;

  if (posts.value.length === 0) {
    root.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-700 rounded-2xl text-center px-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-neutral-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <p class="text-neutral-500 mb-1 text-base font-medium">No ${escHtml(label.value.toLowerCase())}s yet</p>
        <p class="text-neutral-400 text-sm mb-5">Create your first ${escHtml(label.value.toLowerCase())} to get started.</p>
        <a href="/admin/${encodeURIComponent(props.section)}/new"
           class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5">
          Create ${escHtml(label.value)}
        </a>
      </div>`;
    return;
  }

  const cards = posts.value
    .map(
      (post) => `
      <a href="/admin/${encodeURIComponent(props.section)}/${encodeURIComponent(post.id)}"
         class="bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/40 transition-colors p-5 flex flex-col gap-3 group cursor-pointer">
        <div class="flex justify-between items-start">
          <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-orange-500/10 text-orange-400">
            ${escHtml(label.value)}
          </span>
          <span class="text-xs text-neutral-400">
            ${escHtml(formatDate(post.created_at))}
          </span>
        </div>
        <h3 class="text-base font-medium text-neutral-200 line-clamp-2 group-hover:text-orange-400 transition-colors">
          ${escHtml(post.slug)}
        </h3>
        <div class="flex items-center gap-2 mt-auto pt-2 border-t border-neutral-800 text-xs text-neutral-500 group-hover:text-orange-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Edit</span>
        </div>
      </a>`,
    )
    .join('');

  root.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>`;
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-white">
        {{ label }}s
      </h2>
      <a
        :href="`/admin/${props.section}/new`"
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

    <div v-else :id="rootId" />
  </div>
</template>
