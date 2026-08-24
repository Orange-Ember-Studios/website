<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import {
  parseStoredContentToEditorJs,
  serializeEditorJs,
} from '../../lib/editorjs-content.ts';
import type { EditorJsInlineHintId, EditorJsToolbarTool } from '../../lib/editorjs-tools.ts';
import {
  applyEditorJsInlineFormat,
  resolveImageInsertData,
} from '../../lib/editorjs-tools.ts';
import { attachEditorJsMarkdownPaste } from '../../lib/editorjs-paste.ts';
import { EditorJsToolsHeader } from './EditorJsToolsHeader.vue';

const props = defineProps<{
  rootId: string;
  langKey: string;
  initialContent: string;
  onContentChange: (json: string) => void;
  registerSave?: (save: (() => Promise<OutputData>) | null) => void;
  registerRender?: (render: ((data: OutputData) => Promise<void>) | null) => void;
  minimal?: boolean;
}>();

const editorReady = ref(false);
const editorRef = ref<EditorJS | null>(null);

async function createEditorInstance(
  holder: HTMLElement,
  data: OutputData,
): Promise<EditorJS> {
  const [
    { default: Editor },
    { default: Header },
    { default: List },
    { default: Quote },
    { default: Code },
    { default: Image },
    { default: Delimiter },
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/quote'),
    import('@editorjs/code'),
    import('@editorjs/image'),
    import('@editorjs/delimiter'),
  ]);

  const tools: Record<string, unknown> = {
    header: {
      class: Header,
      config: {
        levels: props.minimal ? [1, 2, 3] : [1, 2, 3, 4],
        defaultLevel: 2,
      },
    },
    list: List,
    quote: Quote,
  };

  if (!props.minimal) {
    tools.code = Code;
    tools.image = {
      class: Image,
      config: {
        uploader: {
          uploadByUrl(url: string) {
            return Promise.resolve({
              success: 1,
              file: { url },
            });
          },
        },
      },
    };
    tools.delimiter = Delimiter;
  }

  return new Editor({
    holder,
    data,
    placeholder: props.minimal
      ? 'Short description...'
      : 'Start writing, or press Tab for tools...',
    tools,
    inlineToolbar: true,
  });
}

async function destroyEditorInstance(editor: EditorJS | null) {
  if (!editor) return;
  try {
    await editor.destroy();
  } catch {
    // already destroyed
  }
}

function insertIndex(editor: EditorJS): number | undefined {
  const current = editor.blocks.getCurrentBlockIndex();
  if (current < 0) return undefined;
  return current + 1;
}

async function insertToolbarBlock(
  editor: EditorJS,
  tool: EditorJsToolbarTool,
): Promise<void> {
  let data = { ...tool.defaultData };

  if (tool.needsUrl) {
    const url = window.prompt('Image URL');
    if (!url?.trim()) return;
    data = resolveImageInsertData(url);
  }

  const index = insertIndex(editor);
  await editor.blocks.insert(tool.blockType, data, {}, index, true);
  const focusIndex =
    index !== undefined ? index : editor.blocks.getBlocksCount() - 1;
  editor.caret.setToBlock(focusIndex, 'end');
}

let detachPaste: (() => void) | null = null;
let cancelled = false;

async function initEditor() {
  cancelled = false;
  editorReady.value = false;
  editorRef.value = null;

  const initial = parseStoredContentToEditorJs(props.initialContent);
  const holder = document.getElementById(props.rootId);
  if (!holder || cancelled) return;
  holder.innerHTML = '';

  try {
    const editor = await createEditorInstance(holder, initial);
    if (cancelled) {
      await destroyEditorInstance(editor);
      return;
    }

    await editor.isReady;

    if (cancelled) {
      await destroyEditorInstance(editor);
      return;
    }

    editorRef.value = editor;
    editorReady.value = true;

    const flushToParent = async () => {
      if (!editor || cancelled) return;
      try {
        const saved = await editor.save();
        props.onContentChange(serializeEditorJs(saved));
      } catch (e) {
        console.error('[EditorJsField] save', e);
      }
    };

    editor.onChange = () => {
      void flushToParent();
    };

    detachPaste = attachEditorJsMarkdownPaste(holder, {
      minimal: !!props.minimal,
      getEditor: () => editorRef.value,
      onInserted: () => void flushToParent(),
    });

    props.registerSave?.(() => editor.save());
    props.registerRender?.(async (data) => {
      if (editor) await editor.render(data);
    });
  } catch (e) {
    console.error('[EditorJsField]', e);
  }
}

watch(() => props.langKey, () => {
  cleanup();
  void initEditor();
});

onMounted(() => {
  void initEditor();
});

onUnmounted(() => {
  cleanup();
});

function cleanup() {
  cancelled = true;
  detachPaste?.();
  detachPaste = null;
  editorReady.value = false;
  props.registerSave?.(null);
  props.registerRender?.(null);
  void destroyEditorInstance(editorRef.value);
  editorRef.value = null;
}

function handleInsertBlock(tool: EditorJsToolbarTool) {
  if (!editorRef.value) return;
  void insertToolbarBlock(editorRef.value, tool).catch((e) => {
    console.error('[EditorJsField] insert block', e);
  });
}

function handleInlineFormat(format: EditorJsInlineHintId) {
  const holder = document.getElementById(props.rootId);
  if (!holder) return;
  applyEditorJsInlineFormat(holder, format);
}

export async function flushEditorContent(
  save: (() => Promise<OutputData>) | null | undefined,
): Promise<string | undefined> {
  if (!save) return undefined;
  try {
    const saved = await save();
    return serializeEditorJs(saved);
  } catch {
    return undefined;
  }
}
</script>

<template>
  <div
    class="editorjs-field"
    :class="{ 'editorjs-field--ready': editorReady }"
  >
    <EditorJsToolsHeader
      :minimal="minimal"
      :ready="editorReady"
      :on-insert-block="handleInsertBlock"
      :on-inline-format="handleInlineFormat"
    />
    <div class="editorjs-wrapper">
      <div :id="rootId" />
    </div>
  </div>
</template>
