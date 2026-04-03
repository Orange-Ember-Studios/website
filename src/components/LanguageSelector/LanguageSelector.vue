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
        class="bg-[#18191f] text-white"
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

const supportedLanguages = getSupportedLanguages();
const selectedLanguage = ref<SupportedLanguage>(getCurrentLanguage());

const onLanguageChange = () => {
  setLanguage(selectedLanguage.value);
  translateAll();
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
