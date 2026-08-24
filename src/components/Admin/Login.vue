<template>
  <div class="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
    <div class="bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700 w-full max-w-md backdrop-blur-lg bg-opacity-80 transition-all">
      <h2 class="text-3xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-6 text-center">
        {{ getTranslation('admin.login.title') }}
      </h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-neutral-400 mb-2">{{ getTranslation('admin.login.username') }}</label>
          <input v-model="username" type="text"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
            required :placeholder="getTranslation('admin.login.username')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-400 mb-2">{{ getTranslation('admin.login.password') }}</label>
          <input v-model="password" type="password"
            class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
            required placeholder="••••••••" />
        </div>
        <div v-if="error" class="text-red-400 text-sm animate-pulse text-center">
          {{ error }}
        </div>
        <button type="submit" :disabled="loading"
          class="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? getTranslation('admin.login.authenticating') : getTranslation('admin.login.signIn') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getTranslation } from '../../i18n/i18n';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    });

    const data = await res.json();
    if (!res.ok) {
      error.value = data.error || getTranslation('admin.login.error_auth');
    } else {
      window.location.href = '/admin';
    }
  } catch (e) {
    error.value = getTranslation('admin.login.error_network');
  } finally {
    loading.value = false;
  }
};
</script>
