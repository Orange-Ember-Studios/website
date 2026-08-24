<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getTranslation } from '@/i18n/i18n.ts';

interface User {
  userId: string;
  username: string;
}

const loadingUser = ref(true);
const updating = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const user = ref<User | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = (await res.json()) as { user: User };
      user.value = data.user;
    }
  } catch (err) {
    console.error('Error fetching user:', err);
  } finally {
    loadingUser.value = false;
  }
});

async function handleChangePassword() {
  errorMsg.value = '';
  successMsg.value = '';

  const form = document.getElementById(
    'profile-password-form',
  ) as HTMLFormElement | null;
  if (!form) return;

  const fd = new FormData(form);
  const currentPw = String(fd.get('currentPassword') ?? '');
  const newPw = String(fd.get('newPassword') ?? '');
  const confirmPw = String(fd.get('confirmPassword') ?? '');

  if (newPw !== confirmPw) {
    errorMsg.value = getTranslation('admin.profile.error_match');
    return;
  }
  if (newPw.length < 6) {
    errorMsg.value = getTranslation('admin.profile.error_length');
    return;
  }

  updating.value = true;
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = (await res.json()) as { error?: string };
    if (res.ok) {
      successMsg.value = getTranslation('admin.profile.success');
      form.reset();
    } else {
      errorMsg.value = data.error || getTranslation('admin.profile.updatePassword');
    }
  } catch {
    errorMsg.value = getTranslation('admin.profile.error_network');
  } finally {
    updating.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      <div class="px-8 py-6 border-b border-neutral-800">
        <h2 class="text-xl font-bold text-white">
          {{ getTranslation('admin.profile.title') }}
        </h2>
        <p class="text-neutral-400 text-sm mt-1">
          {{ getTranslation('admin.profile.subtitle') }}
        </p>
      </div>

      <div class="p-8 space-y-8">
        <section>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-4">
            {{ getTranslation('admin.profile.basicInfo') }}
          </h3>

          <div v-if="loadingUser" class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-4 py-1">
              <div class="h-4 bg-neutral-800 rounded w-3/4" />
              <div class="h-4 bg-neutral-800 rounded w-1/2" />
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">
                {{ getTranslation('admin.login.username') }}
              </label>
              <div class="text-white font-medium bg-neutral-950 px-4 py-2.5 rounded-lg border border-neutral-700">
                <span>{{ user?.username || '–' }}</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">
                {{ getTranslation('admin.profile.userId') }}
              </label>
              <div class="text-neutral-400 text-sm bg-neutral-950 px-4 py-2.5 rounded-lg border border-neutral-700 font-mono truncate">
                <span :title="user?.userId || ''">{{ user?.userId || '–' }}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-4">
            {{ getTranslation('admin.profile.changePassword') }}
          </h3>
          <form id="profile-password-form" class="space-y-4" autocomplete="on">
            <label
              for="profile-password-username"
              class="sr-only"
            >
              {{ getTranslation('admin.login.username') }}
            </label>
            <input
              id="profile-password-username"
              name="username"
              type="text"
              autocomplete="username"
              readonly
              tabindex="-1"
              class="sr-only"
              :value="user?.username || ''"
            />

            <div>
              <label
                for="currentPassword"
                class="block text-xs font-medium text-neutral-400 mb-1"
              >
                {{ getTranslation('admin.profile.currentPassword') }}
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="newPassword"
                  class="block text-xs font-medium text-neutral-400 mb-1"
                >
                  {{ getTranslation('admin.profile.newPassword') }}
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autocomplete="new-password"
                  placeholder="••••••••"
                  class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label
                  for="confirmPassword"
                  class="block text-xs font-medium text-neutral-400 mb-1"
                >
                  {{ getTranslation('admin.profile.confirmPassword') }}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  placeholder="••••••••"
                  class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div
              v-if="errorMsg"
              class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
            >
              {{ errorMsg }}
            </div>
            <div
              v-if="successMsg"
              class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm"
            >
              {{ successMsg }}
            </div>

            <div class="pt-2">
              <button
                id="profile-save-btn"
                type="button"
                :disabled="updating"
                class="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
                @click="handleChangePassword"
              >
                {{ updating ? getTranslation('admin.profile.updating') : getTranslation('admin.profile.updatePassword') }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
