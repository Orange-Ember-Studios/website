/**
 * Convert common Markdown inline syntax to HTML for Editor.js block `text` fields.
 * Editor.js stores inline formatting as HTML (e.g. `<b>`, `<i>`, `<a>`, `<code>`).
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, "&#39;");
}

type Placeholder = { token: string; html: string };

/** Stash segments so later passes do not re-process inner markup. */
function applyInlinePass(
  input: string,
  pattern: RegExp,
  build: (match: string, ...groups: string[]) => string,
): string {
  const placeholders: Placeholder[] = [];
  let index = 0;

  const replaced = input.replace(pattern, (...args) => {
    const match = args[0] as string;
    const groups = args.slice(1, -2) as string[];
    const html = build(match, ...groups);
    const token = `\uE000${index++}\uE001`;
    placeholders.push({ token, html });
    return token;
  });

  return placeholders.reduce(
    (text, { token, html }) => text.split(token).join(html),
    replaced,
  );
}

/**
 * Markdown inline → HTML for Editor.js.
 * Supports `**bold**`, `*italic*`, `` `code` ``, `[label](url)`.
 */
export function markdownInlineToHtml(text: string): string {
  if (!text) return "";

  let result = text;

  result = applyInlinePass(
    result,
    /`([^`\n]+)`/g,
    (_m, code) => `<code>${escapeHtml(code)}</code>`,
  );

  result = applyInlinePass(
    result,
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label, url) =>
      `<a href="${escapeAttr(url)}">${markdownInlineToHtml(label)}</a>`,
  );

  result = applyInlinePass(
    result,
    /\*\*([^*\n]+)\*\*/g,
    (_m, inner) => `<b>${markdownInlineToHtml(inner)}</b>`,
  );

  result = applyInlinePass(
    result,
    /__([^_\n]+)__/g,
    (_m, inner) => `<b>${markdownInlineToHtml(inner)}</b>`,
  );

  result = applyInlinePass(
    result,
    /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    (_m, inner) => `<i>${markdownInlineToHtml(inner)}</i>`,
  );

  result = applyInlinePass(
    result,
    /(?<!_)_([^_\n]+)_(?!_)/g,
    (_m, inner) => `<i>${markdownInlineToHtml(inner)}</i>`,
  );

  return result;
}

/** True when text contains inline Markdown worth converting on paste. */
export function hasMarkdownInlineSyntax(text: string): boolean {
  return (
    /\*\*[^*\n]+\*\*/.test(text) ||
    /__[^_\n]+__/.test(text) ||
    /(?<!\*)\*[^*\n]+\*(?!\*)/.test(text) ||
    /`[^`\n]+`/.test(text) ||
    /\[[^\]]+\]\([^)]+\)/.test(text)
  );
}
