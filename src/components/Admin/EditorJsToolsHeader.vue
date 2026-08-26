<script setup lang="ts">
import type { EditorJsInlineHintId, EditorJsToolbarTool } from '../../lib/editorjs-tools.ts';
import {
  EDITOR_JS_INLINE_HINTS,
  getEditorJsBlockTools,
  getEditorJsHeadingTools,
} from '../../lib/editorjs-tools.ts';

defineProps<{
  minimal?: boolean;
  ready: boolean;
  onInsertBlock: (tool: EditorJsToolbarTool) => void;
  onInlineFormat: (format: EditorJsInlineHintId) => void;
}>();

function ToolIcon(props: { toolId: string }) {
  const common = 'h-4 w-4';
  if (props.toolId.startsWith('header-')) {
    const level = props.toolId.replace('header-', 'H');
    return `<span class="text-[11px] font-bold leading-none tracking-tight">${level}</span>`;
  }
  switch (props.toolId) {
    case 'list-unordered':
      return `<svg class="${common}" viewBox="0 0 16 16" fill="currentColor" aria-hidden><circle cx="2" cy="4" r="1.2"/><circle cx="2" cy="8" r="1.2"/><circle cx="2" cy="12" r="1.2"/><rect x="5" y="3.25" width="9" height="1.5" rx="0.5"/><rect x="5" y="7.25" width="9" height="1.5" rx="0.5"/><rect x="5" y="11.25" width="9" height="1.5" rx="0.5"/></svg>`;
    case 'list-ordered':
      return `<span class="text-[10px] font-bold leading-none">1.</span>`;
    case 'quote':
      return `<svg class="${common}" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M3 4h3v5H4.5a1.5 1.5 0 100 3H3V4zm7 0h3v5h-1.5a1.5 1.5 0 100 3H10V4z"/></svg>`;
    case 'code':
      return `<svg class="${common}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden><path d="M5 4L2 8l3 4M11 4l3 4-3 4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case 'image':
      return `<svg class="${common}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="5.5" cy="6.5" r="1" fill="currentColor" stroke="none"/><path d="M2 11l3.5-3 2.5 2 3-3.5L14 11" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case 'delimiter':
      return `<svg class="${common}" viewBox="0 0 16 16" fill="currentColor" aria-hidden><rect x="2" y="7.25" width="12" height="1.5" rx="0.75"/></svg>`;
    default:
      return null;
  }
}
</script>

<template>
  <div class="editorjs-tools-header" role="toolbar" aria-label="Editor blocks and formatting">
    <div class="editorjs-tools-header__row">
      <span class="editorjs-tools-header__section-label">Headings</span>
      <div class="editorjs-tools-header__actions">
        <button
          v-for="tool in getEditorJsHeadingTools(minimal)"
          :key="tool.id"
          type="button"
          class="editorjs-tool-btn"
          :title="tool.title"
          :aria-label="tool.label"
          :disabled="!ready"
          @click="onInsertBlock(tool)"
          v-html="'<span class=\'editorjs-tool-btn__icon\'>' + ToolIcon({ toolId: tool.id }) + '</span><span class=\'editorjs-tool-btn__label hidden sm:inline\'>' + tool.label + '</span>'"
        />
      </div>
    </div>

    <div class="editorjs-tools-header__row">
      <span class="editorjs-tools-header__section-label">Blocks</span>
      <div class="editorjs-tools-header__actions">
        <button
          v-for="tool in getEditorJsBlockTools(minimal)"
          :key="tool.id"
          type="button"
          class="editorjs-tool-btn"
          :title="tool.title"
          :aria-label="tool.label"
          :disabled="!ready"
          @click="onInsertBlock(tool)"
          v-html="'<span class=\'editorjs-tool-btn__icon\'>' + ToolIcon({ toolId: tool.id }) + '</span><span class=\'editorjs-tool-btn__label hidden sm:inline\'>' + tool.label + '</span>'"
        />
      </div>
    </div>

    <div class="editorjs-tools-header__row editorjs-tools-header__row--inline">
      <span class="editorjs-tools-header__section-label">Inline</span>
      <p class="editorjs-tools-header__hint hidden md:block">
        Select text, then apply formatting
      </p>
      <div class="editorjs-tools-header__actions editorjs-tools-header__actions--hints">
        <button
          v-for="hint in EDITOR_JS_INLINE_HINTS"
          :key="hint.id"
          type="button"
          class="editorjs-inline-hint editorjs-inline-hint--btn"
          :title="`${hint.label} (${hint.shortcut})`"
          :aria-label="hint.label"
          :disabled="!ready"
          @click="onInlineFormat(hint.id)"
        >
          <span class="editorjs-inline-hint__mark">{{ hint.shortLabel }}</span>
          <span class="editorjs-inline-hint__shortcut hidden lg:inline">{{ hint.shortcut }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
