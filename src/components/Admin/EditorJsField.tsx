import { createEffect, createSignal } from "@emberkit/core";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import {
  parseStoredContentToEditorJs,
  serializeEditorJs,
} from "../../lib/editorjs-content.ts";
import type { EditorJsInlineHintId, EditorJsToolbarTool } from "../../lib/editorjs-tools.ts";
import {
  applyEditorJsInlineFormat,
  resolveImageInsertData,
} from "../../lib/editorjs-tools.ts";
import { attachEditorJsMarkdownPaste } from "../../lib/editorjs-paste.ts";
import { EditorJsToolsHeader } from "./EditorJsToolsHeader.tsx";

type EditorInstance = EditorJS;

async function createEditor(
  holder: HTMLElement,
  data: OutputData,
  minimal: boolean,
  onChange: () => void,
): Promise<EditorInstance> {
  const [
    { default: Editor },
    { default: Header },
    { default: List },
    { default: Quote },
    { default: Code },
    { default: Image },
    { default: Delimiter },
  ] = await Promise.all([
    import("@editorjs/editorjs"),
    import("@editorjs/header"),
    import("@editorjs/list"),
    import("@editorjs/quote"),
    import("@editorjs/code"),
    import("@editorjs/image"),
    import("@editorjs/delimiter"),
  ]);

  const tools: Record<string, unknown> = {
    header: {
      class: Header,
      config: {
        levels: minimal ? [1, 2, 3] : [1, 2, 3, 4],
        defaultLevel: 2,
      },
    },
    list: List,
    quote: Quote,
  };

  if (!minimal) {
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
    placeholder: minimal
      ? "Short description…"
      : "Start writing, or press Tab for tools…",
    tools,
    inlineToolbar: true,
    onChange: () => onChange(),
  });
}

async function destroyEditor(editor: EditorInstance | null) {
  if (!editor) return;
  try {
    await editor.destroy();
  } catch {
    /* already destroyed */
  }
}

function insertIndex(editor: EditorInstance): number | undefined {
  const current = editor.blocks.getCurrentBlockIndex();
  if (current < 0) return undefined;
  return current + 1;
}

async function insertToolbarBlock(
  editor: EditorInstance,
  tool: EditorJsToolbarTool,
): Promise<void> {
  let data = { ...tool.defaultData };

  if (tool.needsUrl) {
    const url = window.prompt("Image URL");
    if (!url?.trim()) return;
    data = resolveImageInsertData(url);
  }

  const index = insertIndex(editor);
  await editor.blocks.insert(tool.blockType, data, {}, index, true);
  const focusIndex =
    index !== undefined ? index : editor.blocks.getBlocksCount() - 1;
  editor.caret.setToBlock(focusIndex, "end");
}

export function EditorJsField(props: {
  rootId: string;
  /** Remount when language tab changes */
  langKey: string;
  /** Editor.js JSON string or legacy markdown */
  initialContent: string;
  onContentChange: (json: string) => void;
  /** Async snapshot before save */
  registerSave?: (save: (() => Promise<OutputData>) | null) => void;
  /** Replace blocks after async fetch */
  registerRender?: (render: ((data: OutputData) => Promise<void>) | null) => void;
  /** Fewer block types for project descriptions */
  minimal?: boolean;
}) {
  const [editorReady, setEditorReady] = createSignal(false);
  const editorRef: { current: EditorInstance | null } = { current: null };

  createEffect(() => {
    void props.langKey;
    const initial = parseStoredContentToEditorJs(props.initialContent);
    const id = props.rootId;
    let editor: EditorInstance | null = null;
    let detachPaste: (() => void) | null = null;
    let cancelled = false;

    setEditorReady(false);
    editorRef.current = null;

    const flushToParent = async () => {
      if (!editor || cancelled) return;
      try {
        const saved = await editor.save();
        props.onContentChange(serializeEditorJs(saved));
      } catch (e) {
        console.error("[EditorJsField] save", e);
      }
    };

    void (async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const holder = document.getElementById(id);
      if (!holder || cancelled) return;
      holder.innerHTML = "";

      try {
        editor = await createEditor(
          holder,
          initial,
          !!props.minimal,
          () => void flushToParent(),
        );
        if (cancelled) {
          await destroyEditor(editor);
          editor = null;
          return;
        }

        await editor.isReady;

        if (cancelled) {
          await destroyEditor(editor);
          editor = null;
          return;
        }

        editorRef.current = editor;
        setEditorReady(true);

        detachPaste = attachEditorJsMarkdownPaste(holder, {
          minimal: !!props.minimal,
          getEditor: () => editorRef.current,
          onInserted: () => void flushToParent(),
        });

        props.registerSave?.(() => editor!.save());
        props.registerRender?.(async (data) => {
          if (editor) await editor.render(data);
        });
      } catch (e) {
        console.error("[EditorJsField]", e);
      }
    })();

    return () => {
      cancelled = true;
      detachPaste?.();
      detachPaste = null;
      setEditorReady(false);
      editorRef.current = null;
      props.registerSave?.(null);
      props.registerRender?.(null);
      void destroyEditor(editor);
      editor = null;
    };
  });

  const handleInsert = (tool: EditorJsToolbarTool) => {
    const editor = editorRef.current;
    if (!editor) return;
    void insertToolbarBlock(editor, tool).catch((e) => {
      console.error("[EditorJsField] insert block", e);
    });
  };

  const handleInline = (format: EditorJsInlineHintId) => {
    const holder = document.getElementById(props.rootId);
    if (!holder) return;
    applyEditorJsInlineFormat(holder, format);
  };

  return (
    <div
      class={`editorjs-field${editorReady() ? " editorjs-field--ready" : ""}`}
    >
      <EditorJsToolsHeader
        minimal={props.minimal}
        ready={editorReady()}
        onInsertBlock={handleInsert}
        onInlineFormat={handleInline}
      />
      <div class="editorjs-wrapper">
        <div id={props.rootId} />
      </div>
    </div>
  );
}

/** Await latest blocks before POST. */
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
