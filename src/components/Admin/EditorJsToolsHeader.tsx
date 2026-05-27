import type { EditorJsInlineHintId, EditorJsToolbarTool } from "../../lib/editorjs-tools.ts";
import {
  EDITOR_JS_INLINE_HINTS,
  getEditorJsBlockTools,
  getEditorJsHeadingTools,
} from "../../lib/editorjs-tools.ts";

function ToolIcon(props: { toolId: string }) {
  const common = "h-4 w-4";
  if (props.toolId.startsWith("header-")) {
    const level = props.toolId.replace("header-", "H");
    return (
      <span class="text-[11px] font-bold leading-none tracking-tight">{level}</span>
    );
  }
  switch (props.toolId) {
    case "list-unordered":
      return (
        <svg class={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="2" cy="4" r="1.2" />
          <circle cx="2" cy="8" r="1.2" />
          <circle cx="2" cy="12" r="1.2" />
          <rect x="5" y="3.25" width="9" height="1.5" rx="0.5" />
          <rect x="5" y="7.25" width="9" height="1.5" rx="0.5" />
          <rect x="5" y="11.25" width="9" height="1.5" rx="0.5" />
        </svg>
      );
    case "list-ordered":
      return (
        <span class="text-[10px] font-bold leading-none">1.</span>
      );
    case "quote":
      return (
        <svg class={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M3 4h3v5H4.5a1.5 1.5 0 100 3H3V4zm7 0h3v5h-1.5a1.5 1.5 0 100 3H10V4z" />
        </svg>
      );
    case "code":
      return (
        <svg class={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden>
          <path d="M5 4L2 8l3 4M11 4l3 4-3 4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      );
    case "image":
      return (
        <svg class={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden>
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <circle cx="5.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          <path d="M2 11l3.5-3 2.5 2 3-3.5L14 11" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      );
    case "delimiter":
      return (
        <svg class={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" />
        </svg>
      );
    default:
      return null;
  }
}

function BlockToolButton(props: {
  tool: EditorJsToolbarTool;
  disabled: boolean;
  onInsert: (tool: EditorJsToolbarTool) => void;
}) {
  return (
    <button
      type="button"
      class="editorjs-tool-btn"
      title={props.tool.title}
      aria-label={props.tool.label}
      disabled={props.disabled}
      onClick={() => props.onInsert(props.tool)}
    >
      <span class="editorjs-tool-btn__icon">
        <ToolIcon toolId={props.tool.id} />
      </span>
      <span class="editorjs-tool-btn__label hidden sm:inline">{props.tool.label}</span>
    </button>
  );
}

function InlineToolButton(props: {
  label: string;
  shortLabel: string;
  shortcut: string;
  disabled: boolean;
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      class="editorjs-inline-hint editorjs-inline-hint--btn"
      title={`${props.label} (${props.shortcut})`}
      aria-label={props.label}
      disabled={props.disabled}
      onClick={() => props.onApply()}
    >
      <span class="editorjs-inline-hint__mark">{props.shortLabel}</span>
      <span class="editorjs-inline-hint__shortcut hidden lg:inline">
        {props.shortcut}
      </span>
    </button>
  );
}

export function EditorJsToolsHeader(props: {
  minimal?: boolean;
  ready: boolean;
  onInsertBlock: (tool: EditorJsToolbarTool) => void;
  onInlineFormat: (format: EditorJsInlineHintId) => void;
}) {
  const headingTools = getEditorJsHeadingTools(!!props.minimal);
  const blockTools = getEditorJsBlockTools(!!props.minimal);

  return (
    <div class="editorjs-tools-header" role="toolbar" aria-label="Editor blocks and formatting">
      <div class="editorjs-tools-header__row">
        <span class="editorjs-tools-header__section-label">Headings</span>
        <div class="editorjs-tools-header__actions">
          {headingTools.map((tool) => (
            <BlockToolButton
              key={tool.id}
              tool={tool}
              disabled={!props.ready}
              onInsert={props.onInsertBlock}
            />
          ))}
        </div>
      </div>

      <div class="editorjs-tools-header__row">
        <span class="editorjs-tools-header__section-label">Blocks</span>
        <div class="editorjs-tools-header__actions">
          {blockTools.map((tool) => (
            <BlockToolButton
              key={tool.id}
              tool={tool}
              disabled={!props.ready}
              onInsert={props.onInsertBlock}
            />
          ))}
        </div>
      </div>

      <div class="editorjs-tools-header__row editorjs-tools-header__row--inline">
        <span class="editorjs-tools-header__section-label">Inline</span>
        <p class="editorjs-tools-header__hint hidden md:block">
          Select text, then apply formatting
        </p>
        <div class="editorjs-tools-header__actions editorjs-tools-header__actions--hints">
          {EDITOR_JS_INLINE_HINTS.map((hint) => (
            <InlineToolButton
              key={hint.id}
              label={hint.label}
              shortLabel={hint.shortLabel}
              shortcut={hint.shortcut}
              disabled={!props.ready}
              onApply={() => props.onInlineFormat(hint.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
