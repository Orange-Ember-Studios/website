<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="p-8 border-b border-neutral-800 bg-linear-to-br from-neutral-800/50 to-transparent">
        <h2 class="text-2xl font-bold text-white mb-2">{{ getTranslation('admin.profile.title') }}</h2>
        <p class="text-neutral-400 text-sm">{{ getTranslation('admin.profile.subtitle') }}</p>
      </div>

      <div class="p-8 space-y-8">
        <!-- Basic Info -->
        <section>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-orange-500 mb-4">{{ getTranslation('admin.profile.basicInfo') }}</h3>
          <div v-if="loadingUser" class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-4 py-1">
              <div class="h-4 bg-neutral-800 rounded w-3/4"></div>
              <div class="h-4 bg-neutral-800 rounded w-1/2"></div>
            </div>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-medium text-neutral-500 mb-1">{{ getTranslation('admin.login.username') }}</label>
              <div class="text-white font-medium bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800">
                {{ user?.username || '...' }}
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-500 mb-1">{{ getTranslation('admin.profile.userId') }}</label>
              <div
                class="text-neutral-400 text-sm bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800 font-mono truncate"
                :title="user?.userId">
                {{ user?.userId || '...' }}
              </div>
            </div>
          </div>
        </section>

        <!-- Change Password -->
        <section>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-orange-500 mb-4">{{ getTranslation('admin.profile.changePassword') }}</h3>
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-xs font-medium text-neutral-500 mb-1">{{ getTranslation('admin.profile.currentPassword') }}</label>
              <input id="currentPassword" type="password" v-model="passwordForm.currentPassword" placeholder="••••••••"
                class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-hidden focus:border-orange-500 transition-colors"
                required />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="newPassword" class="block text-xs font-medium text-neutral-500 mb-1">{{ getTranslation('admin.profile.newPassword') }}</label>
                <input id="newPassword" type="password" v-model="passwordForm.newPassword" placeholder="••••••••"
                  class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-hidden focus:border-orange-500 transition-colors"
                  required />
              </div>
              <div>
                <label for="confirmPassword" class="block text-xs font-medium text-neutral-500 mb-1">{{ getTranslation('admin.profile.confirmPassword') }}</label>
                <input id="confirmPassword" type="password" v-model="passwordForm.confirmPassword"
                  placeholder="••••••••"
                  class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-hidden focus:border-orange-500 transition-colors"
                  required />
              </div>
            </div>

            <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {{ error }}
            </div>

            <div v-if="success"
              class="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {{ success }}
            </div>

            <div class="pt-2">
              <button type="submit" :disabled="updating"
                class="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5">
                {{ updating ? getTranslation('admin.profile.updating') : getTranslation('admin.profile.updatePassword') }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTranslation } from '../../i18n/i18n';

const user = ref<any>(null);
const loadingUser = ref(true);
const updating = ref(false);
const error = ref('');
const success = ref('');

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const fetchUser = async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      user.value = data.user;
    }
  } catch (err) {
    console.error('Error fetching user:', err);
  } finally {
    loadingUser.value = false;
  }
};

const handleChangePassword = async () => {
  error.value = '';
  success.value = '';

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error.value = getTranslation('admin.profile.error_match');
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    error.value = getTranslation('admin.profile.error_length');
    return;
  }

  updating.value = true;
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    });

    const data = await res.json();
    if (res.ok) {
      success.value = getTranslation('admin.profile.success');
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } else {
      error.value = data.error || getTranslation('admin.profile.updatePassword');
    }
  } catch (err) {
    error.value = getTranslation('admin.profile.error_network');
    console.error(err);
  } finally {
    updating.value = false;
  }
};

onMounted(() => {
  fetchUser();
});
</script>
