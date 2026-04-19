<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-200 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col hidden md:flex">
      <div class="p-6 border-b border-neutral-800">
        <h1 class="text-xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          OE Studios
        </h1>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <button v-for="type in contentTypes" :key="type.id"
          @click="setActiveType(type.id)"
          :class="['flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all group', 
                   activeType === type.id ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-neutral-500 hover:text-white hover:bg-neutral-800']">
          
          <svg v-if="type.id === 'blog'" class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 6H15m-3 4h3m-3 4h3m-3 4h3"></path>
          </svg>
          <svg v-else-if="type.id === 'project'" class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <svg v-else class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>

          {{ getTranslation(`admin.dashboard.${type.id === 'blog' ? 'blogPosts' : type.id === 'project' ? 'portfolio' : 'caseStudies'}`) }}
        </button>
      </nav>
      <div class="p-4 border-t border-neutral-800 space-y-2">
        <button @click="setActiveType('profile')"
          :class="['flex items-center gap-3 px-4 py-2 rounded-lg w-full transition-all group', 
                   activeType === 'profile' ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']">
          <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          {{ getTranslation('admin.dashboard.profile') }}
        </button>
        <button @click="logout"
          class="flex items-center gap-3 px-4 py-2 text-neutral-400 hover:text-white w-full transition-colors group">
          <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          {{ getTranslation('admin.dashboard.signOut') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Topbar -->
      <header
        class="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between px-6">
        <h2 class="text-lg font-semibold capitalize">{{ getTranslation(`admin.dashboard.${activeType === 'blog' ? 'blogPosts' : activeType === 'project' ? 'portfolio' : activeType === 'case_study' ? 'caseStudies' : 'profile'}`) }}</h2>
        <button v-if="activeType !== 'profile'" @click="createNewPost"
          class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5">
          {{ getTranslation('admin.dashboard.newPost') }}
        </button>
      </header>

      <!-- Content Area -->
      <div class="flex-1 p-6 overflow-auto">
        <Profile v-if="activeType === 'profile'" />
        
        <div v-else-if="loading" class="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
          <div class="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          {{ getTranslation('admin.dashboard.loading') }}
        </div>
        
        <div v-else-if="filteredPosts.length === 0" class="flex flex-col items-center justify-center py-20 text-neutral-500 gap-2 border-2 border-dashed border-neutral-800 rounded-2xl">
           <p>{{ getTranslation('admin.dashboard.noContent') }}</p>
           <button @click="createNewPost" class="text-orange-500 hover:underline text-sm font-medium">{{ getTranslation('admin.dashboard.createFirst') }}</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="post in filteredPosts" :key="post.id"
            class="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors cursor-pointer group flex flex-col justify-between p-5"
            @click="editPost(post)">
            <div>
              <div class="flex justify-between items-start mb-4">
                <span
                  class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-neutral-800 text-neutral-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">{{
                    post.type }}</span>
                <span class="text-xs text-neutral-500">{{ new Date(post.created_at).toLocaleDateString() }}</span>
              </div>
              <h3 class="text-lg font-medium text-white mb-2">{{ post.slug }}</h3>
            </div>
            <div
              class="flex items-center gap-2 mt-4 text-xs font-medium text-neutral-500 group-hover:text-orange-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                </path>
              </svg>
              {{ getTranslation('admin.dashboard.editContent') }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Editor Modal -->
    <Editor v-if="editingPost" :post="editingPost" @close="closeEditor" @saved="refreshPosts" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getTranslation } from '../../i18n/i18n';
import Editor from './Editor.vue';
import Profile from './Profile.vue';

const posts = ref<any[]>([]);
const loading = ref(true);
const editingPost = ref<any | null>(null);
const activeType = ref('blog');

// Sync with URL Path Segments
const setActiveType = (type: string) => {
  activeType.value = type;
  window.history.pushState({}, '', `/admin/${type}`);
};

const syncWithUrl = async () => {
  const path = window.location.pathname.replace(/\/$/, '').split('/');
  // Expected: ['', 'admin', 'type', 'id']
  if (path[2]) {
    const type = path[2] === 'projects' ? 'project' : 
                 path[2] === 'case-studies' ? 'case_study' : path[2];
    
    if (contentTypes.find(t => t.id === type) || type === 'profile') {
      activeType.value = type;
      
      if (path[3] && posts.value.length > 0) {
        const postSummary = posts.value.find(p => p.id === path[3] || p.slug === path[3]);
        if (postSummary) {
          await editPost(postSummary);
        }
      }
    }
  }
};

const contentTypes = [
  { id: 'blog', name: 'Blog Posts', icon: 'svg-post' },
  { id: 'project', name: 'Portfolio', icon: 'svg-project' },
  { id: 'case_study', name: 'Case Studies', icon: 'svg-case' }
];

const filteredPosts = computed(() => {
  return posts.value.filter(p => p.type === activeType.value);
});

const fetchPosts = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/admin/posts');
    posts.value = await res.json();
    await syncWithUrl();
  } catch (error) {
    console.error('Error fetching posts:', error);
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/admin/login';
};

const createNewPost = () => {
  editingPost.value = {
    id: 'new',
    slug: 'new-url',
    type: activeType.value,
    author: 'Orange Ember',
    image: '',
    translations: [
      { lang: 'en', title: '', content: '{"blocks":[]}', published: false },
      { lang: 'es', title: '', content: '{"blocks":[]}', published: false },
      { lang: 'fr', title: '', content: '{"blocks":[]}', published: false }
    ]
  };
};

const editPost = async (postSummary: any) => {
  const res = await fetch(`/api/admin/posts/${postSummary.id}`);
  const postDetails = await res.json();

  // Ensure all 3 languages exist in state
  const targetLangs = ['en', 'es', 'fr'];
  const translations = targetLangs.map(lang => {
    return postDetails.translations.find((t: any) => t.lang === lang) || {
      lang, title: '', content: '{"blocks":[]}', published: false
    };
  });

  editingPost.value = { ...postDetails, translations };
  window.history.pushState({}, '', `/admin/${activeType.value}/${postDetails.id}`);
};

const closeEditor = () => {
  editingPost.value = null;
  window.history.pushState({}, '', `/admin/${activeType.value}`);
};

const refreshPosts = () => {
  closeEditor();
  fetchPosts();
};

onMounted(() => {
  fetchPosts();
});
</script>
