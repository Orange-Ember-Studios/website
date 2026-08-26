import {
  CODE_LANGUAGES,
  DEFAULT_CODE_LANGUAGE,
  normalizeCodeLanguage,
} from "./editorjs-code-languages.ts";

export interface CodeBlockData {
  code: string;
  language: string;
}

/**
 * Editor.js code block with a language selector (GDScript by default), so posts
 * can be highlighted per language instead of always falling back to JavaScript.
 *
 * Implemented as a plain class to avoid depending on Editor.js internals: the
 * editor only requires `render()` / `save()`.
 */
export class CodeBlockTool {
  static get toolbox() {
    return {
      title: "Code",
      icon: '<svg width="17" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6"/></svg>',
    };
  }

  static get enableLineBreaks() {
    return true;
  }

  static get sanitize() {
    return { code: false, language: false };
  }

  static get pasteConfig() {
    return { tags: ["pre"] };
  }

  private data: CodeBlockData;
  private textarea: HTMLTextAreaElement | null = null;
  private select: HTMLSelectElement | null = null;

  constructor({ data }: { data?: Partial<CodeBlockData> } = {}) {
    this.data = {
      code: String(data?.code ?? ""),
      language: normalizeCodeLanguage(data?.language),
    };
  }

  render(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "editorjs-code-block";

    const header = document.createElement("div");
    header.className = "editorjs-code-block__header";

    const label = document.createElement("span");
    label.className = "editorjs-code-block__label";
    label.textContent = "Code";

    const select = document.createElement("select");
    select.className = "editorjs-code-block__language";
    select.setAttribute("aria-label", "Code language");
    for (const lang of CODE_LANGUAGES) {
      const option = document.createElement("option");
      option.value = lang.id;
      option.textContent = lang.label;
      select.appendChild(option);
    }
    select.value = this.data.language;
    select.addEventListener("change", () => {
      this.data.language = normalizeCodeLanguage(select.value);
    });

    header.append(label, select);

    const textarea = document.createElement("textarea");
    textarea.className = "editorjs-code-block__code";
    textarea.spellcheck = false;
    textarea.placeholder = "extends Node\n\nfunc _ready() -> void:";
    textarea.value = this.data.code;
    textarea.addEventListener("input", () => {
      this.data.code = textarea.value;
    });
    // Tab must indent the snippet instead of leaving the code block.
    textarea.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      textarea.value = `${textarea.value.slice(0, start)}\t${textarea.value.slice(end)}`;
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      this.data.code = textarea.value;
    });

    wrapper.append(header, textarea);
    this.select = select;
    this.textarea = textarea;
    return wrapper;
  }

  save(): CodeBlockData {
    return {
      code: this.textarea ? this.textarea.value : this.data.code,
      language: normalizeCodeLanguage(
        this.select ? this.select.value : this.data.language,
      ),
    };
  }

  validate(data: CodeBlockData): boolean {
    return String(data?.code ?? "").trim().length > 0;
  }

  onPaste(event: { detail: { data?: HTMLElement } }): void {
    const text = event?.detail?.data?.textContent ?? "";
    this.data = { code: text, language: DEFAULT_CODE_LANGUAGE };
    if (this.textarea) this.textarea.value = text;
  }
}

export default CodeBlockTool;
