import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import {
  type EditorJsBlock,
  isEditorJsOutput,
  markdownToEditorJs,
} from "./editorjs-content.ts";
import { hasMarkdownInlineSyntax } from "./markdown-inline.ts";

const MINIMAL_BLOCK_TYPES = new Set([
  "paragraph",
  "header",
  "list",
  "quote",
]);

/** True when clipboard text should be parsed as Markdown (not plain inline text). */
export function looksLikeMarkdown(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (tryParseEditorJsBlocks(trimmed)) return true;

  const lines = trimmed.split(/\r?\n/);

  if (lines.length >= 2) {
    return (
      lines.some((line) => isMarkdownLine(line.trim())) ||
      hasMarkdownInlineSyntax(trimmed)
    );
  }

  return isMarkdownLine(trimmed) || hasMarkdownInlineSyntax(trimmed);
}

function isMarkdownLine(line: string): boolean {
  if (!line) return false;
  return (
    /^#{1,6}\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(line)
  );
}

/** Parse Editor.js JSON from clipboard when present. */
export function tryParseEditorJsBlocks(text: string): EditorJsBlock[] | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (isEditorJsOutput(parsed) && parsed.blocks.length > 0) {
      return parsed.blocks;
    }
  } catch {
    /* not JSON */
  }
  return null;
}

/** Drop or downgrade block types that are disabled in minimal editors. */
export function filterBlocksForEditor(
  blocks: EditorJsBlock[],
  minimal: boolean,
): EditorJsBlock[] {
  if (!minimal) return blocks;

  return blocks.flatMap((block) => {
    if (MINIMAL_BLOCK_TYPES.has(block.type)) return [block];

    if (block.type === "delimiter") return [];

    if (block.type === "code" && "code" in (block.data as object)) {
      const data = block.data as { code?: string };
      return [
        {
          type: "paragraph",
          data: { text: data.code ?? "" },
        } as EditorJsBlock,
      ];
    }

    return [];
  });
}

/** Convert clipboard Markdown (or Editor.js JSON) into blocks for insertion. */
export function clipboardTextToEditorJsBlocks(
  text: string,
  minimal: boolean,
): EditorJsBlock[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fromJson = tryParseEditorJsBlocks(trimmed);
  if (fromJson) {
    return filterBlocksForEditor(fromJson, minimal);
  }

  if (!looksLikeMarkdown(trimmed)) return null;

  const { blocks } = markdownToEditorJs(trimmed);
  const filtered = filterBlocksForEditor(blocks, minimal);
  return filtered.length > 0 ? filtered : null;
}

type EditorInstance = EditorJS;

/**
 * Insert pasted blocks at the caret, replacing an empty paragraph when appropriate.
 */
export async function insertPastedEditorJsBlocks(
  editor: EditorInstance,
  blocks: EditorJsBlock[],
): Promise<void> {
  if (blocks.length === 0) return;

  let insertAt = editor.blocks.getCurrentBlockIndex();
  const saved: OutputData = await editor.save();
  const blockCount = saved.blocks?.length ?? 0;

  if (insertAt < 0) {
    insertAt = blockCount;
  }

  const current = saved.blocks?.[insertAt];
  const currentText =
    current?.type === "paragraph"
      ? String((current.data as { text?: string })?.text ?? "")
      : "";
  const replaceEmpty =
    current?.type === "paragraph" && !currentText.trim() && blockCount > 0;

  if (replaceEmpty) {
    await editor.blocks.delete(insertAt);
  } else if (insertAt >= 0) {
    insertAt += 1;
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const index = insertAt >= 0 ? insertAt + i : undefined;
    await editor.blocks.insert(
      block.type as string,
      block.data as Record<string, unknown>,
      {},
      index,
      i === blocks.length - 1,
    );
  }

  const focusIndex =
    (insertAt >= 0 ? insertAt : editor.blocks.getBlocksCount() - blocks.length) +
    blocks.length -
    1;
  editor.caret.setToBlock(focusIndex, "end");
}

export type EditorJsPasteHandlerOptions = {
  minimal: boolean;
  getEditor: () => EditorInstance | null;
  onInserted: () => void;
};

/**
 * Capture-phase paste listener: converts Markdown / Editor.js JSON into blocks.
 * Returns a detach function.
 */
export function attachEditorJsMarkdownPaste(
  holder: HTMLElement,
  options: EditorJsPasteHandlerOptions,
): () => void {
  const onPaste = (event: Event) => {
    const clipboardEvent = event as ClipboardEvent;
    const editor = options.getEditor();
    if (!editor || !clipboardEvent.clipboardData) return;

    const text = clipboardEvent.clipboardData.getData("text/plain");
    const blocks = clipboardTextToEditorJsBlocks(text, options.minimal);
    if (!blocks) return;

    clipboardEvent.preventDefault();
    clipboardEvent.stopImmediatePropagation();

    void insertPastedEditorJsBlocks(editor, blocks)
      .then(() => options.onInserted())
      .catch((err) => {
        console.error("[EditorJsField] markdown paste", err);
      });
  };

  holder.addEventListener("paste", onPaste, true);
  return () => holder.removeEventListener("paste", onPaste, true);
}
