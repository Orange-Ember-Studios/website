/** Toolbar block actions for the admin Editor.js field. */

export type EditorJsToolbarToolId =
  | "header-1"
  | "header-2"
  | "header-3"
  | "header-4"
  | "list-unordered"
  | "list-ordered"
  | "quote"
  | "code"
  | "image"
  | "delimiter";

export type EditorJsToolbarTool = {
  id: EditorJsToolbarToolId;
  label: string;
  shortLabel: string;
  title: string;
  blockType: string;
  defaultData: Record<string, unknown>;
  /** Requires a URL before insert (image). */
  needsUrl?: boolean;
};

export type EditorJsInlineHintId = "bold" | "italic" | "link";

const HEADER_1: EditorJsToolbarTool = {
  id: "header-1",
  label: "Heading 1",
  shortLabel: "H1",
  title: "Insert a level 1 heading",
  blockType: "header",
  defaultData: { text: "", level: 1 },
};

const HEADER_2: EditorJsToolbarTool = {
  id: "header-2",
  label: "Heading 2",
  shortLabel: "H2",
  title: "Insert a level 2 heading",
  blockType: "header",
  defaultData: { text: "", level: 2 },
};

const HEADER_3: EditorJsToolbarTool = {
  id: "header-3",
  label: "Heading 3",
  shortLabel: "H3",
  title: "Insert a level 3 heading",
  blockType: "header",
  defaultData: { text: "", level: 3 },
};

const HEADER_4: EditorJsToolbarTool = {
  id: "header-4",
  label: "Heading 4",
  shortLabel: "H4",
  title: "Insert a level 4 heading",
  blockType: "header",
  defaultData: { text: "", level: 4 },
};

const LIST_UNORDERED: EditorJsToolbarTool = {
  id: "list-unordered",
  label: "Bulleted list",
  shortLabel: "List",
  title: "Insert a bulleted list",
  blockType: "list",
  defaultData: { style: "unordered", items: [""] },
};

const LIST_ORDERED: EditorJsToolbarTool = {
  id: "list-ordered",
  label: "Numbered list",
  shortLabel: "1.",
  title: "Insert a numbered list",
  blockType: "list",
  defaultData: { style: "ordered", items: [""] },
};

const QUOTE: EditorJsToolbarTool = {
  id: "quote",
  label: "Quote",
  shortLabel: "“",
  title: "Insert a quote block",
  blockType: "quote",
  defaultData: { text: "", caption: "", alignment: "left" },
};

const CODE: EditorJsToolbarTool = {
  id: "code",
  label: "Code",
  shortLabel: "</>",
  title: "Insert a code block",
  blockType: "code",
  defaultData: { code: "" },
};

const IMAGE: EditorJsToolbarTool = {
  id: "image",
  label: "Image",
  shortLabel: "Img",
  title: "Insert an image by URL",
  blockType: "image",
  defaultData: { file: { url: "" }, caption: "" },
  needsUrl: true,
};

const DELIMITER: EditorJsToolbarTool = {
  id: "delimiter",
  label: "Delimiter",
  shortLabel: "—",
  title: "Insert a section divider",
  blockType: "delimiter",
  defaultData: {},
};

const MINIMAL_HEADINGS: EditorJsToolbarTool[] = [HEADER_1, HEADER_2, HEADER_3];
const FULL_HEADINGS: EditorJsToolbarTool[] = [HEADER_1, HEADER_2, HEADER_3, HEADER_4];

const MINIMAL_BLOCKS: EditorJsToolbarTool[] = [LIST_UNORDERED, QUOTE];
const FULL_BLOCKS: EditorJsToolbarTool[] = [
  LIST_UNORDERED,
  LIST_ORDERED,
  QUOTE,
  CODE,
  IMAGE,
  DELIMITER,
];

export function getEditorJsHeadingTools(minimal: boolean): EditorJsToolbarTool[] {
  return minimal ? [...MINIMAL_HEADINGS] : [...FULL_HEADINGS];
}

export function getEditorJsBlockTools(minimal: boolean): EditorJsToolbarTool[] {
  return minimal ? [...MINIMAL_BLOCKS] : [...FULL_BLOCKS];
}

/** @deprecated Use getEditorJsHeadingTools + getEditorJsBlockTools */
export function getEditorJsToolbarTools(minimal: boolean): EditorJsToolbarTool[] {
  return [...getEditorJsHeadingTools(minimal), ...getEditorJsBlockTools(minimal)];
}

export const EDITOR_JS_INLINE_HINTS = [
  { id: "bold" as const, label: "Bold", shortLabel: "B", shortcut: "⌘B" },
  { id: "italic" as const, label: "Italic", shortLabel: "I", shortcut: "⌘I" },
  { id: "link" as const, label: "Link", shortLabel: "Link", shortcut: "⌘K" },
];

export function resolveImageInsertData(url: string): Record<string, unknown> {
  return {
    file: { url: url.trim() },
    caption: "",
  };
}

/** Apply inline formatting to the current selection inside the editor holder. */
export function applyEditorJsInlineFormat(
  holder: HTMLElement,
  format: EditorJsInlineHintId,
): boolean {
  const selection = window.getSelection();
  const editable =
    holder.querySelector<HTMLElement>("[contenteditable=true]") ?? holder;

  if (!selection || selection.isCollapsed) {
    editable.focus();
    return false;
  }

  const anchor = selection.anchorNode;
  if (!anchor || !holder.contains(anchor)) {
    editable.focus();
    return false;
  }

  if (format === "link") {
    const url = window.prompt("Link URL", "https://");
    if (!url?.trim()) return false;
    document.execCommand("createLink", false, url.trim());
    return true;
  }

  document.execCommand(format, false);
  return true;
}
