<script setup lang="ts">
import { ref } from 'vue';
import { Book, FileText, LogOut, Menu, User, X } from 'lucide-vue-next';

defineProps<{
  section: 'blog' | 'project' | 'case_study' | 'profile';
  title: string;
}>();

const navItems = [
  { id: 'blog', label: 'Blog Posts', href: '/admin/blog', Icon: Book },
  { id: 'project', label: 'Projects', href: '/admin/project', Icon: FileText },
  { id: 'case_study', label: 'Case Studies', href: '/admin/case_study', Icon: FileText },
] as const;

const sectionLabels: Record<string, string> = {
  blog: 'Blog Posts',
  project: 'Projects',
  case_study: 'Case Studies',
  profile: 'Profile',
};

const menuOpen = ref(false);

function toggleMobile() {
  menuOpen.value = !menuOpen.value;
}

function closeMobile() {
  menuOpen.value = false;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/admin/login';
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-neutral-950">
    <aside class="w-64 bg-neutral-900 border-r border-neutral-800 flex-col hidden md:flex">
      <div class="p-6 border-b border-neutral-800">
        <h1 class="text-xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          OE Studios
        </h1>
        <p class="text-[11px] text-neutral-500 mt-1 tracking-wide uppercase">
          Content Manager
        </p>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="item.href"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
          :class="section === item.id ? 'bg-orange-500/10 text-orange-400 font-medium border-l-2 border-orange-500' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border-l-2 border-transparent'"
        >
          <component :is="item.Icon" class="w-5 h-5 shrink-0" />
          <span>{{ item.label }}</span>
        </a>
      </nav>
      <div class="p-4 border-t border-neutral-800 space-y-1">
        <a
          href="/admin/profile"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all"
          :class="section === 'profile' ? 'bg-orange-500/10 text-orange-400 font-medium border-l-2 border-orange-500' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border-l-2 border-transparent'"
        >
          <User class="w-5 h-5 shrink-0" />
          <span>Profile</span>
        </a>
        <button
          type="button"
          @click="logout"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-all text-neutral-400 hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut class="w-5 h-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <div
      v-if="menuOpen"
      class="fixed inset-0 z-40 md:hidden"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="closeMobile"
      />
      <aside class="absolute inset-y-0 left-0 w-72 bg-neutral-900 border-r border-neutral-800 shadow-2xl shadow-black/40 flex flex-col">
        <div class="p-6 border-b border-neutral-800 flex items-center justify-between">
          <h1 class="text-xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            OE Studios
          </h1>
          <button
            type="button"
            @click="closeMobile"
            class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="item.href"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
            :class="section === item.id ? 'bg-orange-500/10 text-orange-400 font-medium border-l-2 border-orange-500' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border-l-2 border-transparent'"
          >
            <component :is="item.Icon" class="w-5 h-5 shrink-0" />
            <span>{{ item.label }}</span>
          </a>
        </nav>
        <div class="p-3 border-t border-neutral-800 space-y-1">
          <a
            href="/admin/profile"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all"
            :class="section === 'profile' ? 'bg-orange-500/10 text-orange-400 font-medium border-l-2 border-orange-500' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border-l-2 border-transparent'"
          >
            <User class="w-5 h-5 shrink-0" />
            <span>Profile</span>
          </a>
          <button
            type="button"
            @click="logout"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-all text-neutral-400 hover:text-red-400 hover:bg-red-500/5"
          >
            <LogOut class="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>

    <div class="flex-1 flex flex-col min-h-screen">
      <header class="h-16 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-4 md:px-6 shrink-0">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="toggleMobile"
            class="md:hidden p-2 -ml-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Menu class="w-5 h-5" />
          </button>
          <nav class="flex items-center gap-2 text-sm">
            <a href="/admin" class="text-neutral-500 hover:text-neutral-300 transition-colors">
              Admin
            </a>
            <span class="text-neutral-700">/</span>
            <span class="text-neutral-300 font-medium">
              {{ sectionLabels[section] || section }}
            </span>
          </nav>
        </div>
        <span class="hidden sm:inline-block text-xs text-neutral-500 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-800">
          {{ sectionLabels[section] }}
        </span>
      </header>
      <main class="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-neutral-950 text-neutral-200">
        <slot />
      </main>
    </div>
  </div>
</template>
