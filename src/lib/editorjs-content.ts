import type { OutputData } from "@editorjs/editorjs";
import { editorJsToMarkdown } from "./markdown-migrator.ts";

export const EMPTY_EDITOR_JS = '{"blocks":[]}';

export type EditorJsBlock = OutputData["blocks"] extends (infer B)[] | undefined
  ? B
  : never;

export function isEditorJsOutput(
  value: unknown,
): value is { blocks: EditorJsBlock[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { blocks?: unknown }).blocks)
  );
}

/** Parse stored post/translation content into Editor.js output (JSON or legacy markdown). */
export function parseStoredContentToEditorJs(raw: string): OutputData {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { blocks: [] };

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (isEditorJsOutput(parsed)) {
      return { blocks: parsed.blocks };
    }
  } catch {
    /* legacy markdown or plain text */
  }

  if (trimmed.startsWith("{") && trimmed.includes('"blocks"')) {
    return { blocks: [] };
  }

  return markdownToEditorJs(trimmed);
}

/** Serialize Editor.js document for DB storage. */
export function serializeEditorJs(data: OutputData): string {
  return JSON.stringify({ blocks: data.blocks ?? [] });
}

/**
 * Best-effort markdown → Editor.js for posts edited as markdown under Milkdown.
 * Uses the same block types as `parseEditorJsBlocks` / `editorJsToMarkdown`.
 */
export function markdownToEditorJs(markdown: string): OutputData {
  const blocks: EditorJsBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const codeFence = trimmed.match(/^```(\w*)/);
    if (codeFence) {
      const lang = codeFence[1] || "javascript";
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({
        type: "code",
        data: { code: codeLines.join("\n"), language: lang },
      } as EditorJsBlock);
      continue;
    }

    const header = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (header) {
      blocks.push({
        type: "header",
        data: { text: header[2], level: header[1].length },
      } as EditorJsBlock);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      blocks.push({
        type: "quote",
        data: { text: trimmed.slice(2), caption: "" },
      } as EditorJsBlock);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({
        type: "list",
        data: { style: "unordered", items },
      } as EditorJsBlock);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({
        type: "list",
        data: { style: "ordered", items },
      } as EditorJsBlock);
      continue;
    }

    const paraLines: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("> ") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({
      type: "paragraph",
      data: { text: paraLines.join("\n") },
    } as EditorJsBlock);
  }

  return { blocks };
}

/** Round-trip helper used in migration scripts. */
export function editorJsJsonToMarkdown(json: string): string {
  try {
    const data = JSON.parse(json) as { blocks?: EditorJsBlock[] };
    if (data?.blocks) return editorJsToMarkdown(data.blocks);
  } catch {
    /* fall through */
  }
  return json;
}
