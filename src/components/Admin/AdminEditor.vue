<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { Check, ChevronDown, ChevronLeft } from 'lucide-vue-next';
import EditorJsField from './EditorJsField.vue';
import type { OutputData } from '@editorjs/editorjs';
import { flushEditorContent } from '../../lib/editorjs-content.ts';
import {
  cloneAdminPostDraft,
  setDraftTranslationPublished,
} from '../../lib/admin-post-draft.ts';
import { getTranslation } from '@/i18n/i18n.ts';
import { resolveImageUrl } from '../../lib/images.ts';

type Translation = {
  lang: string;
  title: string;
  content: string;
  published: boolean;
};

export type AdminPostDraft = {
  id: string;
  slug: string;
  type: string;
  author: string;
  image: string;
  translations: Translation[];
};

const props = defineProps<{
  post: AdminPostDraft;
  onClose: () => void;
  onSaved: () => void;
  section?: string;
}>();

const LANGS = ['en', 'es', 'fr'] as const;
type Lang = (typeof LANGS)[number];

const draft = ref<AdminPostDraft>(cloneAdminPostDraft(props.post));
const activeLang = ref<string>('en');
const saving = ref(false);
const saveError = ref('');
const dirty = ref(false);
const justSaved = ref(false);
let savedTimer: ReturnType<typeof setTimeout> | null = null;

const sectionSlug = computed(() => props.section || draft.value.type);
const sectionLabel = computed(() => {
  const labels: Record<string, string> = {
    blog: 'Blog Posts',
    project: 'Projects',
    case_study: 'Case Studies',
  };
  return labels[sectionSlug.value] ?? 'Content';
});

function markDirty() {
  dirty.value = true;
  justSaved.value = false;
}

function warnBeforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return;
  event.preventDefault();
  event.returnValue = '';
}

onMounted(() => {
  window.addEventListener('beforeunload', warnBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnBeforeUnload);
  if (savedTimer) clearTimeout(savedTimer);
});

const contentSaveRef = ref<(() => Promise<OutputData>) | null>(null);
const descriptionSaveRefs = ref<Record<string, (() => Promise<OutputData>) | null>>({
  en: null,
  es: null,
  fr: null,
});

type ProjectMeta = {
  category: string;
  status: string;
  description: string;
  link: string;
};

const projectMeta = ref<ProjectMeta>({
  category: 'Desktop Game',
  status: 'In Development',
  description: '',
  link: '',
});

const activeTranslation = computed(() => {
  const d = draft.value;
  const lang = activeLang.value;
  return (
    d.translations.find((t) => t.lang === lang) ?? {
      lang,
      title: '',
      content: '{"blocks":[]}',
      published: false,
    }
  );
});

function parseProjectContent(content: string): ProjectMeta {
  try {
    const parsed = JSON.parse(content || '{}');
    return {
      category: parsed.category || 'Desktop Game',
      status: parsed.status || 'In Development',
      description: parsed.description || '',
      link: parsed.link || '',
    };
  } catch {
    return {
      category: 'Desktop Game',
      status: 'In Development',
      description: '',
      link: '',
    };
  }
}

watch(activeLang, (newLang) => {
  if (draft.value.type === 'project') {
    const t = activeTranslation.value;
    const parsed = parseProjectContent(t.content);
    projectMeta.value = parsed;
  }
}, { immediate: true });

const contentInitial = computed(() => activeTranslation.value.content || '{"blocks":[]}');
const descriptionInitial = computed(() => projectMeta.value.description);

function handleClose() {
  if (
    dirty.value &&
    !window.confirm('You have unsaved changes. Discard them and leave the editor?')
  ) {
    return;
  }
  dirty.value = false;
  props.onClose();
}

function switchLang(lang: string) {
  activeLang.value = lang;
}

const isPublished = computed(() => activeTranslation.value.published);

function togglePublished(published: boolean) {
  draft.value = setDraftTranslationPublished(
    draft.value,
    activeLang.value,
    published,
  );
  markDirty();
}

function isLangPublished(lang: string): boolean {
  return Boolean(draft.value.translations.find((t) => t.lang === lang)?.published);
}

async function handleSaveClick(closeAfterSave = false) {
  saving.value = true;
  saveError.value = '';

  try {
    const d = draft.value;
    const lang = activeLang.value;
    let flushedDescription = projectMeta.value.description;
    let flushedContent: string | undefined;

    if (d.type === 'project') {
      const descJson = await flushEditorContent(descriptionSaveRefs.value[lang]);
      if (descJson !== undefined) {
        flushedDescription = descJson;
        projectMeta.value = { ...projectMeta.value, description: descJson };
      }
    } else {
      flushedContent = await flushEditorContent(contentSaveRef.value);
      if (flushedContent !== undefined) {
        const idx = d.translations.findIndex((t) => t.lang === lang);
        if (idx >= 0) {
          d.translations[idx] = { ...d.translations[idx], content: flushedContent! };
        }
      }
    }

    const form = document.getElementById('admin-editor-form') as HTMLFormElement | null;
    const fd = form ? new FormData(form) : null;

    const finalSlug = (fd?.get('slug') as string) || d.slug;
    const finalAuthor = (fd?.get('author') as string) || d.author;
    const finalImage = (fd?.get('image') as string) || '';
    const postType = (fd?.get('post-type') as string) || d.type;

    const translationPayload = LANGS.map((l) => {
      const existing = d.translations.find((t) => t.lang === l);
      if (l === activeLang.value) {
        let content = l === activeLang.value ? (flushedContent ?? existing?.content) : (existing?.content);
        if (postType === 'project') {
          const meta: ProjectMeta = {
            category: (fd?.get(`project-category-${l}`) as string) || projectMeta.value.category,
            status: (fd?.get(`project-status-${l}`) as string) || projectMeta.value.status,
            description: flushedDescription,
            link: (fd?.get(`project-link-${l}`) as string) || projectMeta.value.link,
          };
          if (l === activeLang.value) {
            meta.description = flushedDescription;
          }
          content = JSON.stringify(meta);
        }
        const titleField = fd?.get('post-title');
        return {
          lang: l,
          title: (titleField as string) || existing?.title || '',
          content,
          published: existing?.published ?? false,
        };
      }
      return (
        existing || {
          lang: l,
          title: '',
          content: '{"blocks":[]}',
          published: false,
        }
      );
    });

    const payload = {
      ...(d.id !== 'new' ? { id: d.id } : {}),
      slug: finalSlug,
      type: postType,
      author: finalAuthor,
      image: finalImage,
      translations: translationPayload,
    };

    const endpoint = d.id === 'new' ? '/api/admin/posts' : `/api/admin/posts/${encodeURIComponent(d.id)}`;
    const method = d.id === 'new' ? 'POST' : 'PUT';

    const res = await fetch(endpoint, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      saveError.value = errBody.error || `Save failed (${res.status})`;
      return;
    }

    const savedPost = (await res.json().catch(() => null)) as { id?: string } | null;
    dirty.value = false;

    // A brand new post becomes an existing one: keep editing it under its real
    // URL so the next save updates instead of creating a duplicate.
    if (d.id === 'new' && savedPost?.id) {
      draft.value = { ...draft.value, id: String(savedPost.id) };
      window.history.replaceState(
        {},
        '',
        `/admin/${sectionSlug.value}/${encodeURIComponent(String(savedPost.id))}`,
      );
    }

    if (closeAfterSave) {
      props.onSaved();
      return;
    }

    justSaved.value = true;
    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      justSaved.value = false;
    }, 3000);
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Network error while saving';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center md:p-4">
    <div class="bg-neutral-900 border border-neutral-800 md:rounded-2xl w-full md:w-[96vw] md:max-w-[1600px] h-full md:h-[94vh] flex flex-col shadow-2xl overflow-hidden">
      <form
        id="admin-editor-form"
        class="flex flex-col h-full"
        method="POST"
        @input="markDirty"
        @change="markDirty"
      >
        <div class="px-4 py-3 md:px-6 md:py-4 border-b border-neutral-800 flex flex-col md:flex-row md:justify-between md:items-center bg-neutral-900 gap-4">
          <div class="flex items-center gap-2 w-full md:max-w-5xl">
            <button
              type="button"
              @click="handleClose"
              class="flex items-center gap-1 p-2 -ml-2 shrink-0 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
              :aria-label="`Back to ${sectionLabel}`"
              :title="`Back to ${sectionLabel}`"
            >
              <ChevronLeft class="w-6 h-6 md:w-5 md:h-5" />
              <span class="hidden lg:inline text-sm">{{ sectionLabel }}</span>
            </button>
            <div class="grid grid-cols-2 md:flex md:gap-4 items-center flex-1 gap-3">
              <input
                type="text"
                name="slug"
                :value="draft.slug"
                :placeholder="getTranslation('admin.editor.slug')"
                class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-1/4"
              />
              <input
                type="text"
                name="author"
                :value="draft.author"
                :placeholder="getTranslation('admin.editor.author')"
                class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-1/4"
              />
              <div class="col-span-2 md:flex-1 flex gap-2 items-center">
                <input
                  type="text"
                  name="image"
                  :value="draft.image"
                  :placeholder="getTranslation('admin.editor.image')"
                  list="public-images"
                  class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                />
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
                <div class="w-8 h-8 rounded bg-neutral-800 overflow-hidden border border-neutral-700 shrink-0">
                  <img
                    v-if="draft.image"
                    :src="resolveImageUrl(draft.image)"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div class="col-span-2 md:col-span-1 relative">
                <select
                  name="post-type"
                  :value="draft.type"
                  class="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none text-white appearance-none w-full md:min-w-[100px]"
                >
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
          <div class="flex gap-3 justify-end items-center border-t border-neutral-800 md:border-none pt-3 md:pt-0">
            <label
              class="flex items-center gap-2 text-xs md:text-sm cursor-pointer select-none px-3 py-2 rounded-lg border transition-colors"
              :class="isPublished
                ? 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-neutral-200'"
              :title="`Publish the ${activeLang.toUpperCase()} translation`"
            >
              <input
                type="checkbox"
                class="accent-orange-500"
                :checked="isPublished"
                @change="togglePublished(($event.target as HTMLInputElement).checked)"
              />
              <span>{{ isPublished ? 'Published' : 'Draft' }} ({{ activeLang.toUpperCase() }})</span>
            </label>
            <p v-if="saveError" class="text-red-400 text-xs self-center max-w-[200px] md:max-w-md text-right">
              {{ saveError }}
            </p>
            <span
              v-if="justSaved"
              class="flex items-center gap-1.5 text-xs md:text-sm text-green-400 self-center"
              role="status"
            >
              <Check class="w-4 h-4" />
              Saved
            </span>
            <span
              v-else-if="dirty"
              class="hidden sm:inline text-xs text-neutral-500 self-center"
            >
              Unsaved changes
            </span>
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 text-xs md:text-sm text-neutral-400 hover:text-white transition-colors"
            >
              {{ getTranslation('admin.editor.cancel') }}
            </button>
            <button
              type="button"
              :disabled="saving"
              @click="handleSaveClick(true)"
              class="hidden sm:inline-block border border-neutral-700 hover:border-neutral-500 text-neutral-200 px-4 py-2 rounded-lg text-xs md:text-sm font-medium disabled:opacity-50 transition-all"
            >
              Save &amp; close
            </button>
            <button
              type="button"
              :disabled="saving"
              @click="handleSaveClick(false)"
              class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg disabled:opacity-50 transition-all"
            >
              {{ saving ? getTranslation('admin.editor.saving') : getTranslation('admin.editor.savePost') }}
            </button>
          </div>
        </div>

        <div class="flex border-b border-neutral-800 bg-neutral-900/50 px-4 md:px-6 pt-1 md:pt-2 gap-1 md:gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="lang in LANGS"
            :key="lang"
            type="button"
            @click="switchLang(lang)"
            class="px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0"
            :class="activeLang === lang
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'"
          >
            {{ lang.toUpperCase() }}
            <span
              class="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle"
              :class="isLangPublished(lang) ? 'bg-orange-500' : 'bg-neutral-600'"
              :title="isLangPublished(lang) ? 'Published' : 'Draft'"
            />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 md:px-10 md:py-8 relative bg-neutral-950 custom-scrollbar">
          <div class="max-w-5xl mx-auto">
            <input
              type="text"
              name="post-title"
              :value="activeTranslation.title"
              :placeholder="getTranslation('admin.editor.postTitle')"
              class="w-full bg-transparent text-2xl md:text-4xl font-bold text-white border-none focus:outline-none mb-6 md:mb-8 placeholder-neutral-800"
            />

            <div v-if="draft.type === 'project'" class="space-y-4 md:space-y-6">
              <div>
                <label class="block text-sm font-medium text-neutral-400 mb-2">
                  {{ getTranslation('admin.editor.category') }}
                </label>
                <select
                  name="project-category-en"
                  v-model="projectMeta.category"
                  class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                >
                  <option value="Desktop Game">{{ getTranslation('admin.editor.projectCategory.desktop') }}</option>
                  <option value="Mobile Game">{{ getTranslation('admin.editor.projectCategory.mobileGame') }}</option>
                  <option value="Mobile App">{{ getTranslation('admin.editor.projectCategory.mobileApp') }}</option>
                  <option value="Web Application">{{ getTranslation('admin.editor.projectCategory.webApp') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-400 mb-2">
                  {{ getTranslation('admin.editor.status') }}
                </label>
                <select
                  name="project-status-en"
                  v-model="projectMeta.status"
                  class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                >
                  <option value="Available Now">{{ getTranslation('admin.editor.projectStatus.now') }}</option>
                  <option value="Coming Soon">{{ getTranslation('admin.editor.projectStatus.soon') }}</option>
                  <option value="Publishing">{{ getTranslation('admin.editor.projectStatus.publishing') }}</option>
                  <option value="In Development">{{ getTranslation('admin.editor.projectStatus.dev') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-400 mb-2">
                  {{ getTranslation('admin.editor.shortDescription') }}
                </label>
                <EditorJsField
                  :root-id="`project-description-${activeLang}`"
                  :lang-key="`project-description-${activeLang}`"
                  :initial-content="descriptionInitial"
                  :minimal="true"
                  :on-content-change="(json) => { projectMeta.description = json; markDirty(); }"
                  :register-save="(fn) => { descriptionSaveRefs[activeLang] = fn; }"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-400 mb-2">
                  {{ getTranslation('admin.editor.externalLink') }}
                </label>
                <input
                  type="url"
                  name="project-link-en"
                  v-model="projectMeta.link"
                  placeholder="https://store.steampowered.com/app/..."
                  class="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                />
              </div>
            </div>
            <EditorJsField
              v-else
              :root-id="`content-${activeLang}`"
              :lang-key="`${activeLang}-${draft.type}`"
              :initial-content="contentInitial"
              :on-content-change="(json) => {
                const idx = draft.translations.findIndex((t) => t.lang === activeLang);
                if (idx >= 0) {
                  draft.translations[idx] = { ...draft.translations[idx], content: json };
                }
                markDirty();
              }"
              :register-save="(fn) => { contentSaveRef = fn; }"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
