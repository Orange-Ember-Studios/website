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
          
          <Newspaper v-if="type.id === 'blog'" class="w-5 h-5 text-current" />
          <ImageIcon v-else-if="type.id === 'project'" class="w-5 h-5 text-current" />
          <FileText v-else class="w-5 h-5 text-current" />

          {{ getTranslation(`admin.dashboard.${type.id === 'blog' ? 'blogPosts' : type.id === 'project' ? 'portfolio' : 'caseStudies'}`) }}
        </button>
      </nav>
      <div class="p-4 border-t border-neutral-800 space-y-2">
        <button @click="setActiveType('profile')"
          :class="['flex items-center gap-3 px-4 py-2 rounded-lg w-full transition-all group', 
                   activeType === 'profile' ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']">
          <User class="w-5 h-5 text-current" />
          {{ getTranslation('admin.dashboard.profile') }}
        </button>
        <button @click="logout"
          class="flex items-center gap-3 px-4 py-2 text-neutral-400 hover:text-white w-full transition-colors group">
          <LogOut class="w-5 h-5 text-current" />
          {{ getTranslation('admin.dashboard.signOut') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
      <!-- Topbar -->
      <header
        class="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Logo or Indicator -->
          <div class="md:hidden w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
             <span class="text-orange-500 font-bold text-xs">OE</span>
          </div>
          <h2 class="text-sm md:text-lg font-semibold capitalize truncate max-w-[150px] md:max-w-none">
            {{ getTranslation(`admin.dashboard.${activeType === 'blog' ? 'blogPosts' : activeType === 'project' ? 'portfolio' : activeType === 'case_study' ? 'caseStudies' : 'profile'}`) }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <button v-if="activeType !== 'profile'" @click="createNewPost"
            class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5">
            {{ getTranslation('admin.dashboard.newPost') }}
          </button>
          
          <button @click="logout" class="md:hidden p-2 text-neutral-400 hover:text-white">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 p-4 md:p-6 overflow-auto">
        <Profile v-if="activeType === 'profile'" />
        
        <div v-else-if="loading" class="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
          <div class="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          {{ getTranslation('admin.dashboard.loading') }}
        </div>
        
        <div v-else-if="filteredPosts.length === 0" class="flex flex-col items-center justify-center py-20 text-neutral-500 gap-2 border-2 border-dashed border-neutral-800 rounded-2xl text-center px-4">
           <p>{{ getTranslation('admin.dashboard.noContent') }}</p>
           <button @click="createNewPost" class="text-orange-500 hover:underline text-sm font-medium">{{ getTranslation('admin.dashboard.createFirst') }}</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div v-for="post in filteredPosts" :key="post.id"
            class="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors cursor-pointer group flex flex-col justify-between p-4 md:p-5 shadow-sm"
            @click="editPost(post)">
            <div>
              <div class="flex justify-between items-start mb-3 md:mb-4">
                <span
                  class="px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider rounded-md bg-neutral-800 text-neutral-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">{{
                    post.type }}</span>
                <span class="text-[10px] md:text-xs text-neutral-500">{{ new Date(post.created_at).toLocaleDateString() }}</span>
              </div>
              <h3 class="text-base md:text-lg font-medium text-white mb-2 line-clamp-2">{{ post.slug }}</h3>
            </div>
            <div
              class="flex items-center gap-2 mt-3 md:mt-4 text-[10px] md:text-xs font-medium text-neutral-500 group-hover:text-orange-400 transition-colors">
              <Pencil class="w-3.5 h-3.5 md:w-4 md:h-4" />
              {{ getTranslation('admin.dashboard.editContent') }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around px-2 z-40">
      <button v-for="type in [...contentTypes, { id: 'profile', name: 'Profile' }]" :key="type.id"
        @click="setActiveType(type.id)"
        class="flex flex-col items-center gap-1 min-w-[64px] transition-colors"
        :class="activeType === type.id ? 'text-orange-500' : 'text-neutral-500'">
        
        <Newspaper v-if="type.id === 'blog'" class="w-5 h-5" />
        <ImageIcon v-else-if="type.id === 'project'" class="w-5 h-5" />
        <FileText v-else-if="type.id === 'case_study'" class="w-5 h-5" />
        <User v-else-if="type.id === 'profile'" class="w-5 h-5" />

        <span class="text-[10px] font-medium tracking-tight">
          {{ type.id === 'blog' ? 'Blog' : type.id === 'project' ? 'Works' : type.id === 'case_study' ? 'Cases' : 'User' }}
        </span>
      </button>
    </nav>

    <!-- Editor Modal -->
    <Editor v-if="editingPost" :post="editingPost" @close="closeEditor" @saved="refreshPosts" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getTranslation } from '../../i18n/i18n';
import Editor from './Editor.vue';
import Profile from './Profile.vue';
import { 
  Newspaper, 
  Image as ImageIcon, 
  FileText, 
  User, 
  LogOut, 
  Pencil 
} from 'lucide-vue-next';

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
