<template>
  <div class="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center md:p-4">
    <div
      class="bg-neutral-900 border border-neutral-800 md:rounded-2xl w-full md:max-w-5xl h-full md:h-[90vh] flex flex-col shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="px-4 py-3 md:px-6 md:py-4 border-b border-neutral-800 flex flex-col md:flex-row md:justify-between md:items-center bg-neutral-900 gap-4">
        <div class="flex items-center gap-2 w-full md:max-w-3xl">
          <!-- Mobile Back Button -->
          <button @click="handleClose" class="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white transition-colors" aria-label="Back">
            <ChevronLeft class="w-6 h-6" />
          </button>

          <div class="grid grid-cols-2 md:flex md:gap-4 items-center flex-1 gap-3">
            <input v-model="draft.slug" :placeholder="getTranslation('admin.editor.slug')"
              class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-1/4" />
            <input v-model="draft.author" :placeholder="getTranslation('admin.editor.author')"
              class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-1/4" />
            
            <div class="col-span-2 md:flex-1 flex gap-2 items-center">
              <input v-model="draft.image" :placeholder="getTranslation('admin.editor.image')" list="public-images"
                class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full" />
              <datalist id="public-images">
                <optgroup label="Blog Images">
                  <option value="/blog/astro-islands.jpg" />
                  <option value="/blog/exact-slice-accuracy.jpg" />
                  <option value="/blog/gaming-future.jpg" />
                  <option value="/blog/inverse-pulse-creation.jpg" />
                  <option value="/blog/micro-interactions-godot.jpg" />
                  <option value="/blog/studio-founding.jpg" />
                </optgroup>
                <optgroup label="Project Images">
                  <option value="/projects/photo-1504384308090-c894fdcc538d.avif" />
                  <option value="/projects/photo-1512941937669-90a1b58e7e9c.avif" />
                  <option value="/projects/photo-1542751371-adc38448a05e.avif" />
                  <option value="/projects/photo-1550745165-9bc0b252726f.avif" />
                </optgroup>
              </datalist>
              <div v-if="draft.image" class="w-8 h-8 rounded bg-neutral-800 overflow-hidden border border-neutral-700 shrink-0">
                <img :src="resolveImageUrl(draft.image)" class="w-full h-full object-cover" />
              </div>
            </div>
            
            <div class="col-span-2 md:col-span-1 relative">
              <select v-model="draft.type"
                class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none text-white appearance-none w-full md:min-w-[100px]">
                <option value="blog">{{ getTranslation('admin.dashboard.blogPosts') }}</option>
                <option value="project">{{ getTranslation('admin.dashboard.portfolio') }}</option>
                <option value="case_study">{{ getTranslation('admin.dashboard.caseStudies') }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <ChevronDown class="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end border-t border-neutral-800 md:border-none pt-3 md:pt-0">
          <button @click="handleClose"
            class="px-4 py-2 text-xs md:text-sm text-neutral-400 hover:text-white transition-colors">{{ getTranslation('admin.editor.cancel') }}</button>
          <button @click="save" :disabled="saving"
            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg disabled:opacity-50 transition-all">
            {{ saving ? getTranslation('admin.editor.saving') : getTranslation('admin.editor.savePost') }}
          </button>
        </div>
      </div>

      <!-- Language Tabs container -->
      <div class="flex border-b border-neutral-800 bg-neutral-900/50 px-4 md:px-6 pt-1 md:pt-2 gap-1 md:gap-2 overflow-x-auto no-scrollbar">
        <button v-for="lang in ['en', 'es', 'fr']" :key="lang" @click="switchLang(lang)"
          :class="['px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0', activeLang === lang ? 'border-orange-500 text-orange-400' : 'border-transparent text-neutral-500 hover:text-neutral-300']">
          {{ lang.toUpperCase() }}
        </button>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 relative bg-neutral-950 custom-scrollbar">
        <div class="max-w-3xl mx-auto">
          <input v-model="activeTranslation.title" :placeholder="getTranslation('admin.editor.postTitle')"
            class="w-full bg-transparent text-2xl md:text-4xl font-bold text-white border-none focus:outline-none mb-6 md:mb-8 placeholder-neutral-800" />
            
          <!-- Project Configuration -->
          <div v-if="draft.type === 'project'" class="space-y-4 md:space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">{{ getTranslation('admin.editor.category') }}</label>
              <select v-model="projectMeta.category" class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full">
                <option value="Desktop Game">{{ getTranslation('admin.editor.projectCategory.desktop') }}</option>
                <option value="Mobile Game">{{ getTranslation('admin.editor.projectCategory.mobileGame') }}</option>
                <option value="Mobile App">{{ getTranslation('admin.editor.projectCategory.mobileApp') }}</option>
                <option value="Web Application">{{ getTranslation('admin.editor.projectCategory.webApp') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">{{ getTranslation('admin.editor.status') }}</label>
              <select v-model="projectMeta.status" class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full">
                <option value="Available Now">{{ getTranslation('admin.editor.projectStatus.now') }}</option>
                <option value="Coming Soon">{{ getTranslation('admin.editor.projectStatus.soon') }}</option>
                <option value="Publishing">{{ getTranslation('admin.editor.projectStatus.publishing') }}</option>
                <option value="In Development">{{ getTranslation('admin.editor.projectStatus.dev') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">{{ getTranslation('admin.editor.shortDescription') }}</label>
              <textarea v-model="projectMeta.description" :placeholder="getTranslation('admin.editor.shortDescriptionPlaceholder')"
                class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full min-h-[100px]"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">{{ getTranslation('admin.editor.externalLink') }}</label>
              <input v-model="projectMeta.link" type="url" placeholder="https://store.steampowered.com/app/..."
                class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full" />
            </div>
          </div>

          <!-- Milkdown Editor -->
          <MilkdownEditor v-if="draft.type !== 'project'" v-model="activeTranslation.content" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getTranslation } from '../../i18n/i18n';
import { resolveImageUrl } from '../../lib/images';
import MilkdownEditor from './MilkdownEditor.vue';
import { ChevronLeft, ChevronDown } from 'lucide-vue-next';

const props = defineProps<{ post: any }>();
const emit = defineEmits(['close', 'saved']);

// Deep clone to avoid mutating props directly
const draft = ref(JSON.parse(JSON.stringify(props.post)));
const activeLang = ref('en');
const saving = ref(false);

const activeTranslation = ref(draft.value.translations.find((t: any) => t.lang === activeLang.value));

const projectMeta = ref({
  category: 'Desktop Game',
  status: 'In Development',
  description: '',
  link: ''
});

const loadProjectMeta = () => {
  if (draft.value.type === 'project') {
    try {
      // Projects still use JSON in content for their metadata
      const parsed = JSON.parse(activeTranslation.value.content || "{}");
      
      projectMeta.value = {
        category: parsed.category || 'Desktop Game',
        status: parsed.status || 'In Development',
        description: parsed.description || '',
        link: parsed.link || ''
      };
    } catch(e) {
      projectMeta.value = { category: 'Desktop Game', status: 'In Development', description: '', link: '' };
    }
  }
};

watch(
  projectMeta,
  (val) => {
    if (draft.value.type === 'project') {
      activeTranslation.value.content = JSON.stringify(val);
    }
  },
  { deep: true }
);

watch(
  activeTranslation,
  () => {
    if (draft.value.type === 'project') {
      loadProjectMeta();
    }
  }
);

const handleClose = () => {
  emit('close');
};

const switchLang = async (lang: string) => {
  activeLang.value = lang;
  activeTranslation.value = draft.value.translations.find((t: any) => t.lang === lang);
  
  if (draft.value.type === 'project') {
    loadProjectMeta();
  }
};

const save = async () => {
  saving.value = true;

  const endpoint = draft.value.id === 'new' ? '/api/admin/posts' : `/api/admin/posts/${draft.value.id}`;
  const method = draft.value.id === 'new' ? 'POST' : 'PUT';

  await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft.value)
  });

  saving.value = false;
  emit('saved');
};

onMounted(() => {
  if (draft.value.type === 'project') {
    loadProjectMeta();
  }
});
</script>

<style>
/* Custom Editor.js overrides for Dark Mode */
.codex-editor__redactor {
  padding-bottom: 100px !important;
}

.ce-paragraph {
  color: #e5e5e5;
  line-height: 1.7;
}

.ce-header {
  color: white;
  font-weight: bold;
}

h1.ce-header { font-size: 2.5em; }
h2.ce-header { font-size: 1.8em; }
h3.ce-header { font-size: 1.3em; }

.cdx-quote {
  border-left: 4px solid #f97316;
  background-color: #171717;
  padding: 1rem;
  border-radius: 4px;
}

.ce-popover,
.ce-inline-toolbar {
  background-color: #262626;
  border-color: #404040;
  color: white;
}

.ce-popover__item:hover,
.ce-inline-toolbar__button:hover {
  background-color: #404040;
}

.tc-wrap {
  --color-border: #404040;
  --color-background: #171717;
}
</style>
