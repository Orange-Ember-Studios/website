<script setup lang="ts">
import { computed, ref } from 'vue';
import AdminShell from './AdminShell.vue';
import PostList from './PostList.vue';
import AdminProfile from './AdminProfile.vue';
import AdminEditor, { type AdminPostDraft } from './AdminEditor.vue';
import {
  emptyAdminPostDraft,
  toAdminPostDraft,
} from '../../lib/admin-post-draft.ts';

type Section = 'blog' | 'project' | 'case_study' | 'profile';

const props = defineProps<{
  section?: Section;
  postId?: string;
}>();

const section = ref<Section>(props.section ?? 'blog');
const listType = computed<'blog' | 'project' | 'case_study'>(() =>
  section.value === 'profile' ? 'blog' : section.value,
);
const authChecked = ref(false);
const draft = ref<AdminPostDraft | null>(null);
const draftError = ref('');
const loadingDraft = ref(Boolean(props.postId));

function backToList() {
  window.location.href = `/admin/${section.value}`;
}

async function loadDraft(id: string) {
  if (id === 'new') {
    draft.value = emptyAdminPostDraft(listType.value);
    loadingDraft.value = false;
    return;
  }

  try {
    const res = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, {
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    if (!res.ok) {
      draftError.value =
        res.status === 404 ? 'Post not found.' : `Could not load post (${res.status}).`;
      return;
    }
    draft.value = toAdminPostDraft(await res.json(), listType.value);
  } catch {
    draftError.value = 'Network error while loading the post.';
  } finally {
    loadingDraft.value = false;
  }
}

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = '/admin/login';
      return;
    }
    authChecked.value = true;
    if (props.postId) await loadDraft(props.postId);
  } catch {
    window.location.href = '/admin/login';
  }
}

checkAuth();
</script>

<template>
  <div v-if="!authChecked" class="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4" />
      <p class="text-neutral-400 text-sm">Verifying session...</p>
    </div>
  </div>

  <AdminShell v-else :section="section" title="">
    <AdminProfile v-if="section === 'profile'" />

    <template v-else-if="props.postId">
      <div v-if="loadingDraft" class="flex items-center gap-3 text-neutral-400 text-sm">
        <span class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
        Loading editor...
      </div>
      <div v-else-if="draftError" class="max-w-md">
        <p class="text-red-400 text-sm mb-4">{{ draftError }}</p>
        <button
          type="button"
          @click="backToList"
          class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Back to list
        </button>
      </div>
      <AdminEditor
        v-else-if="draft"
        :post="draft"
        :section="listType"
        :on-close="backToList"
        :on-saved="backToList"
      />
    </template>

    <PostList v-else :post-type="listType" :section="section" />
  </AdminShell>
</template>
