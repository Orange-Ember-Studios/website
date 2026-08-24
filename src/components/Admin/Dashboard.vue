<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-200 flex">
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
          <span class="font-bold">{{ type.icon }}</span>
          {{ getTranslation(`admin.dashboard.${type.id === 'blog' ? 'blogPosts' : type.id === 'project' ? 'portfolio' : 'caseStudies'}`) }}
        </button>
      </nav>
      <div class="p-4 border-t border-neutral-800 space-y-2">
        <button @click="setActiveType('profile')"
          :class="['flex items-center gap-3 px-4 py-2 rounded-lg w-full transition-all group',
                   activeType === 'profile' ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-neutral-400 hover:text-white hover:bg-neutral-800']">
          <span class="font-bold">P</span>
          {{ getTranslation('admin.dashboard.profile') }}
        </button>
        <button @click="logout"
          class="flex items-center gap-3 px-4 py-2 text-neutral-400 hover:text-white w-full transition-colors group">
          <span class="font-bold">L</span>
          {{ getTranslation('admin.dashboard.signOut') }}
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
      <header class="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
        <h2 class="text-sm md:text-lg font-semibold capitalize">
          {{ getTranslation(`admin.dashboard.${activeType === 'blog' ? 'blogPosts' : activeType === 'project' ? 'portfolio' : activeType === 'case_study' ? 'caseStudies' : 'profile'}`) }}
        </h2>
      </header>

      <div class="flex-1 overflow-auto p-4 md:p-6">
        <div v-if="activeType === 'blog' || activeType === 'project' || activeType === 'case_study'" class="space-y-4">
          <div class="flex justify-between items-center">
            <button @click="createNew"
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
              + New {{ activeType }}
            </button>
          </div>

          <div class="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            <table class="w-full">
              <thead class="bg-neutral-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Title</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800">
                <tr v-for="item in items" :key="item.id" class="hover:bg-neutral-800/50">
                  <td class="px-4 py-3">{{ item.title }}</td>
                  <td class="px-4 py-3">
                    <span :class="item.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'"
                      class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ item.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 space-x-2">
                    <button @click="editItem(item)" class="text-orange-400 hover:text-orange-300">Edit</button>
                    <button @click="deleteItem(item)" class="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeType === 'profile'" class="max-w-md">
          <h3 class="text-xl font-bold text-white mb-4">Change Password</h3>
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">Current Password</label>
              <input v-model="currentPassword" type="password"
                class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-400 mb-2">New Password</label>
              <input v-model="newPassword" type="password"
                class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <button type="submit"
              class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTranslation } from '../../i18n/i18n';

const contentTypes = [
  { id: 'blog', icon: 'B' },
  { id: 'project', icon: 'P' },
  { id: 'case_study', icon: 'C' },
];

const activeType = ref('blog');
const items = ref<any[]>([]);
const currentPassword = ref('');
const newPassword = ref('');

const setActiveType = (type: string) => {
  activeType.value = type;
};

const fetchItems = async () => {
  // Simplified - in production this would fetch from API
  items.value = [];
};

const createNew = () => {
  window.location.href = `/admin/${activeType.value}/new`;
};

const editItem = (item: any) => {
  window.location.href = `/admin/${activeType.value}/${item.id}`;
};

const deleteItem = async (item: any) => {
  if (confirm('Are you sure you want to delete this item?')) {
    // Delete logic
  }
};

const changePassword = async () => {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      })
    });

    if (res.ok) {
      alert('Password updated successfully');
      currentPassword.value = '';
      newPassword.value = '';
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to update password');
    }
  } catch (e) {
    alert('Failed to update password');
  }
};

const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/admin/login';
};

onMounted(() => {
  fetchItems();
});
</script>
