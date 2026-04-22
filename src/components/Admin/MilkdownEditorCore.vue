<template>
  <Milkdown />
</template>

<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { history } from '@milkdown/plugin-history';
import { watch } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);

const { get } = useEditor((root) => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, props.modelValue);
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          emit('update:modelValue', markdown);
        }
      });
    })
    .use(nord)
    .use(commonmark)
    .use(listener)
    .use(history);
});

watch(() => props.modelValue, (newValue) => {
  const editor = get();
  if (editor) {
    editor.action((ctx) => {
      const current = ctx.get(defaultValueCtx);
      if (current !== newValue) {
        ctx.set(defaultValueCtx, newValue);
      }
    });
  }
});
</script>
