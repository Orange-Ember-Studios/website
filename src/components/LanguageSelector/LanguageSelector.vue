<template>
  <div class="relative group">
    <label for="lang-select" class="sr-only">Select Language</label>
    <select
      id="lang-select"
      v-model="selectedLanguage"
      @change="onLanguageChange"
      class="appearance-none bg-studio-shield/20 border border-studio-flame-mid/30 rounded-full px-4 py-2 pr-10 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-studio-flame-light/30 hover:bg-studio-shield/40 transition-all duration-300 cursor-pointer"
    >
      <option 
        v-for="lang in supportedLanguages" 
        :key="lang.code" 
        :value="lang.code"
        class="bg-studio-bg text-white"
      >
        {{ lang.label }}
      </option>
    </select>
    <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-studio-flame-light">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  getSupportedLanguages, 
  getCurrentLanguage, 
  setLanguage, 
  translateAll,
  type SupportedLanguage 
} from '../../i18n/i18n';

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/blog/es/")) return "es";
    if (path.startsWith("/blog/fr/")) return "fr";
  }
  return getCurrentLanguage();
};

const supportedLanguages = getSupportedLanguages();
const selectedLanguage = ref<SupportedLanguage>(getInitialLanguage());

const onLanguageChange = () => {
  const newLang = selectedLanguage.value;
  setLanguage(newLang);
  translateAll();

  // Blog post redirection logic to sync with selected language
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    // Check if we are on a blog post (not just the index)
    if (currentPath.startsWith('/blog/') && currentPath !== '/blog' && currentPath !== '/blog/') {
      const segments = currentPath.split('/').filter(s => s.length > 0);
      
      // Supported translation prefixes (excluding default English)
      const langPrefixes = ['es', 'fr'];
      let baseSlug = '';

      if (langPrefixes.includes(segments[1])) {
        // We are already on a translated post, get the base slug
        baseSlug = segments.slice(2).join('/');
      } else {
        // We are on an English post (no prefix)
        baseSlug = segments.slice(1).join('/');
      }

      // Build the new localized path
      let newPath = '/blog';
      if (newLang !== 'en') {
        newPath += `/${newLang}`;
      }
      if (baseSlug) {
        newPath += `/${baseSlug}`;
      }

      // Only redirect if the path changed and is not the same
      if (newPath !== currentPath && newPath !== '/blog' && newPath !== '/blog/') {
        window.location.href = newPath;
      }
    }
  }
};
</script>

<style scoped>
/* Standard Tailwind colors will work fine here since they are in the style block.
   Using the theme color variables from global.css.
*/
select {
  /* Prevent some browser defaults */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>
