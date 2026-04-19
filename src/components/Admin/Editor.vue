<template>
  <div class="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4">
    <div
      class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
        <div class="flex gap-4 items-center w-full max-w-3xl">
          <input v-model="draft.slug" placeholder="slug-url"
            class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-1/4" />
          <input v-model="draft.author" placeholder="Author Name"
            class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-1/4" />
          <div class="flex-1 flex gap-2 items-center">
            <input v-model="draft.image" placeholder="Image Path (e.g. /blog/image.jpg)" list="public-images"
              class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full" />
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
            <div v-if="draft.image" class="w-8 h-8 rounded bg-neutral-800 overflow-hidden border border-neutral-700">
              <img :src="resolveImageUrl(draft.image)" class="w-full h-full object-cover" />
            </div>
          </div>
          <select v-model="draft.type"
            class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-3 py-2 focus:outline-none text-white appearance-none min-w-[100px]">
            <option value="blog">Blog</option>
            <option value="project">Project</option>
            <option value="case_study">Case Study</option>
          </select>
        </div>
        <div class="flex gap-3">
          <button @click="handleClose"
            class="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
          <button @click="save" :disabled="saving"
            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg disabled:opacity-50 transition-all">
            {{ saving ? 'Saving...' : 'Save Post' }}
          </button>
        </div>
      </div>

      <!-- Language Tabs container -->
      <div class="flex border-b border-neutral-800 bg-neutral-900/50 px-6 pt-2 gap-2">
        <button v-for="lang in ['en', 'es', 'fr']" :key="lang" @click="switchLang(lang)"
          :class="['px-4 py-3 text-sm font-medium border-b-2 transition-colors', activeLang === lang ? 'border-orange-500 text-orange-400' : 'border-transparent text-neutral-500 hover:text-neutral-300']">
          {{ lang.toUpperCase() }}
        </button>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 overflow-y-auto p-8 relative bg-neutral-950">
        <div class="max-w-3xl mx-auto">
          <input v-model="activeTranslation.title" placeholder="Post Title"
            class="w-full bg-transparent text-4xl font-bold text-white border-none focus:outline-none mb-8 placeholder-neutral-700" />
            
          <!-- Project Configuration -->
          <div v-if="draft.type === 'project'" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">Category</label>
              <select v-model="projectMeta.category" class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full">
                <option value="Desktop Game">Desktop Game</option>
                <option value="Mobile Game">Mobile Game</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Web Application">Web Application</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">Status</label>
              <select v-model="projectMeta.status" class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full">
                <option value="Available Now">Available Now</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Publishing">Publishing</option>
                <option value="In Development">In Development</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">Short Description</label>
              <textarea v-model="projectMeta.description" placeholder="A short description for the project..."
                class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full min-h-[100px]"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">External Link (Optional)</label>
              <input v-model="projectMeta.link" type="url" placeholder="https://store.steampowered.com/app/..."
                class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full" />
            </div>
          </div>

          <!-- Editor.js Container (hidden for projects) -->
          <div v-show="draft.type !== 'project'" :id="`editorjs-${activeLang}`" class="editor-container prose prose-invert max-w-none text-neutral-200">
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Quote from '@editorjs/quote';
import { resolveImageUrl } from '../../lib/images';

const props = defineProps<{ post: any }>();
const emit = defineEmits(['close', 'saved']);

// Deep clone to avoid mutating props directly
const draft = ref(JSON.parse(JSON.stringify(props.post)));
const activeLang = ref('en');
const saving = ref(false);

const activeTranslation = ref(draft.value.translations.find((t: any) => t.lang === activeLang.value));
const editorInstance = shallowRef<EditorJS | null>(null);

const projectMeta = ref({
  category: 'Desktop Game',
  status: 'In Development',
  description: '',
  link: ''
});

const loadProjectMeta = () => {
  if (draft.value.type === 'project') {
    try {
      const parsed = JSON.parse(activeTranslation.value.content || "{}");
      
      let initialCategory = parsed.category;
      let initialStatus = parsed.status;
      let initialDesc = parsed.description;
      let initialLink = parsed.link;

      // Backward compatibility with generic Editor.js blocks
      if (parsed.blocks && parsed.blocks.length > 0) {
        const paragraphs = parsed.blocks.filter((b: any) => b.type === 'paragraph');
        initialDesc = paragraphs.map((b: any) => b.data.text.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')).join('\n');
        
        const statusMatch = initialDesc.match(/(?:Status|Estado|Statut):\s*([^.]+)/i);
        if (statusMatch) initialStatus = statusMatch[1].trim();

        const categoryMatch = initialDesc.match(/(?:Category|Categoría|Catégorie|Categoria):\s*([^.]+)/i);
        if (categoryMatch) initialCategory = categoryMatch[1].trim();
      }

      projectMeta.value = {
        category: initialCategory || 'Desktop Game',
        status: initialStatus || 'In Development',
        description: initialDesc || '',
        link: initialLink || ''
      };
    } catch(e) {
      projectMeta.value = { category: 'Desktop Game', status: 'In Development', description: '', link: '' };
    }
  }
};

import { watch } from 'vue';

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

watch(
  () => draft.value.type,
  (newType) => {
    if (newType === 'project') {
      if (editorInstance.value) {
        editorInstance.value.destroy();
        editorInstance.value = null;
      }
      loadProjectMeta();
    } else {
      setTimeout(() => initEditor(), 50);
    }
  }
);

class SimpleCode {
  data: any;
  wrapper: any;

  static get toolbox() {
    return { title: 'Code', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>' };
  }
  constructor({ data }: any) {
    this.data = { code: data.code || '' };
    this.wrapper = undefined;
  }
  render() {
    this.wrapper = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.value = this.data.code;
    textarea.placeholder = 'Paste your code here...';
    textarea.style.width = '100%';
    textarea.style.minHeight = '100px';
    textarea.style.background = '#171717';
    textarea.style.color = '#fb923c';
    textarea.style.border = '1px solid #404040';
    textarea.style.borderRadius = '8px';
    textarea.style.padding = '12px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '14px';
    textarea.style.outline = 'none';
    this.wrapper.appendChild(textarea);
    return this.wrapper;
  }
  save(wrapper: any) {
    const textarea = wrapper.querySelector('textarea');
    return { code: textarea.value };
  }
}

const initEditor = () => {
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }

  const contentStr = activeTranslation.value.content;
  let data = { blocks: [] };
  if (contentStr) {
    try { data = JSON.parse(contentStr); } catch (e) { }
  }

  editorInstance.value = new EditorJS({
    holder: `editorjs-${activeLang.value}`,
    data,
    tools: {
      header: { class: Header as any, inlineToolbar: true },
      list: { class: List as any, inlineToolbar: true },
      quote: { class: Quote as any, inlineToolbar: true },
      code: SimpleCode
    },
    onChange: async () => {
      if (editorInstance.value) {
        const savedData = await editorInstance.value.save();
        activeTranslation.value.content = JSON.stringify(savedData);
      }
    }
  });
};

const handleClose = () => {
  emit('close');
};

const switchLang = async (lang: string) => {
  if (editorInstance.value) {
    const savedData = await editorInstance.value.save();
    activeTranslation.value.content = JSON.stringify(savedData);
  }
  activeLang.value = lang;
  activeTranslation.value = draft.value.translations.find((t: any) => t.lang === lang);
  
  if (draft.value.type === 'project') {
    loadProjectMeta();
  } else {
    setTimeout(() => initEditor(), 50); // delay to let DOM element recreate
  }
};

const save = async () => {
  saving.value = true;
  if (editorInstance.value) {
    const savedData = await editorInstance.value.save();
    activeTranslation.value.content = JSON.stringify(savedData);
  }

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
  } else {
    initEditor();
  }
});

onBeforeUnmount(() => {
  if (editorInstance.value) editorInstance.value.destroy();
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
