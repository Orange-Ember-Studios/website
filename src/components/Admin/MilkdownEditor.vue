<template>
  <div class="milkdown-wrapper">
    <MilkdownProvider>
      <MilkdownEditorCore :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" />
    </MilkdownProvider>
  </div>
</template>

<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue';
import MilkdownEditorCore from './MilkdownEditorCore.vue';

defineProps<{
  modelValue: string;
}>();

defineEmits(['update:modelValue']);
</script>

<style>
@reference "../../styles/global.css";

.milkdown-wrapper {
  @apply bg-ash-950/50 rounded-2xl p-2 min-h-[500px] border border-ash-800/50 transition-all focus-within:border-ember-500/30;
}

/* Milkdown Theme Overrides */
.milkdown {
  @apply max-w-none shadow-none bg-transparent text-ash-200 font-sans;
}

.milkdown .editor {
  @apply outline-none py-6 px-4 selection:bg-ember-500/30;
}

/* Typography & Content */
.milkdown .ProseMirror h1 { @apply text-4xl font-bold text-white mb-8 tracking-tight; }
.milkdown .ProseMirror h2 { @apply text-2xl font-bold text-white mt-10 mb-4 tracking-tight; }
.milkdown .ProseMirror h3 { @apply text-xl font-semibold text-ash-100 mt-8 mb-3; }
.milkdown .ProseMirror p { @apply mb-6 leading-relaxed text-ash-300 text-lg; }

.milkdown .ProseMirror ul { @apply list-disc pl-6 mb-6 space-y-2 text-ash-300; }
.milkdown .ProseMirror ol { @apply list-decimal pl-6 mb-6 space-y-2 text-ash-300; }

.milkdown .ProseMirror blockquote { 
  @apply border-l-4 border-ember-500 bg-ash-900/50 px-6 py-4 rounded-r-xl mb-8 italic text-ash-200; 
}

.milkdown .ProseMirror pre { 
  @apply bg-ash-900 p-6 rounded-xl border border-ash-800 mb-8 overflow-x-auto shadow-inner; 
}

.milkdown .ProseMirror code { 
  @apply font-mono text-ember-400 bg-ash-800/80 px-1.5 py-0.5 rounded text-sm; 
}

.milkdown .ProseMirror strong { @apply text-white font-bold; }
.milkdown .ProseMirror a { @apply text-ember-500 underline decoration-ember-500/30 underline-offset-4 hover:text-ember-400 transition-colors; }

/* Hide Milkdown default Slash menu or specific UI elements if they look "off" */
.milkdown .slash-menu {
  @apply bg-ash-900 border border-ash-800 rounded-xl shadow-2xl;
}
</style>

