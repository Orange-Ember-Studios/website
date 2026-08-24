<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import PremiumSelect from '../ui/PremiumSelect.vue';
import type { SupportedLanguage } from '../../i18n/i18n.ts';
import { getCurrentLanguage, getSupportedLanguages, setLanguage } from '../../i18n/i18n.ts';

const props = defineProps<{
  lang?: SupportedLanguage;
  id?: string;
}>();

const supportedLanguages = getSupportedLanguages();
const currentLang = ref(props.lang || getCurrentLanguage());

const langOptions = supportedLanguages.map((lang) => ({
  id: lang.code,
  label: lang.label,
  color:
    lang.code === 'en'
      ? 'bg-blue-500'
      : lang.code === 'es'
        ? 'bg-red-500'
        : 'bg-white/20',
}));

const currentLangLabel = computed(() => {
  const found = supportedLanguages.find((l) => l.code === currentLang.value);
  return found?.label || 'English';
});

function handleChange(e: CustomEvent) {
  const detail = e.detail;
  if (!detail || detail.id !== 'lang-selector') return;

  const newLang = detail.values?.[0] as SupportedLanguage | undefined;
  const codes = supportedLanguages.map((l) => l.code);
  if (!newLang || !codes.includes(newLang)) return;
  if (newLang === currentLang.value) return;

  currentLang.value = newLang;
  setLanguage(newLang, true);
}

onMounted(() => {
  document.addEventListener('change', handleChange as EventListener);
});

onUnmounted(() => {
  document.removeEventListener('change', handleChange as EventListener);
});
</script>

<template>
  <div class="premium-lang-selector-wrapper">
    <PremiumSelect
      id="lang-selector"
      :options="langOptions"
      :is-multiple="false"
      :initial-values="[currentLang]"
      :default-label="currentLangLabel"
      variant="navbar"
      :container-id="id || 'nav-lang-selector'"
    />
  </div>
</template>
