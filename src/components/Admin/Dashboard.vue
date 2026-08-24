<script setup lang="ts">
import { ref } from 'vue';
import AdminShell from './AdminShell.vue';
import PostList from './PostList.vue';
import AdminProfile from './AdminProfile.vue';

const props = defineProps<{
  section?: 'blog' | 'project' | 'case_study' | 'profile';
  postId?: string;
}>();

const authChecked = ref(false);
const authError = ref(false);

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = '/admin/login';
      return;
    }
    authChecked.value = true;
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

  <AdminShell v-else :section="props.section || 'blog'" title="">
    <div v-if="props.section === 'profile'">
      <AdminProfile />
    </div>
    <div v-else>
      <PostList :post-type="props.section || 'blog'" :section="props.section || 'blog'" />
    </div>
  </AdminShell>
</template>
