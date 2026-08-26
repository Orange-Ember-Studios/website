/**
 * Languages offered in the CMS code blocks. The ids must match the languages
 * loaded in the Shiki highlighters (`content-parser.ts`, `posts.service.ts`).
 */
export interface CodeLanguageOption {
  id: string;
  label: string;
}

export const DEFAULT_CODE_LANGUAGE = "gdscript";

export const CODE_LANGUAGES: readonly CodeLanguageOption[] = [
  { id: "gdscript", label: "GDScript" },
  { id: "csharp", label: "C#" },
  { id: "cpp", label: "C++" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "vue", label: "Vue" },
  { id: "astro", label: "Astro" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Shell" },
  { id: "markdown", label: "Markdown" },
  { id: "text", label: "Plain text" },
] as const;

const ALIASES: Record<string, string> = {
  gd: "gdscript",
  godot: "gdscript",
  "gd-script": "gdscript",
  cs: "csharp",
  "c#": "csharp",
  dotnet: "csharp",
  "c++": "cpp",
  cxx: "cpp",
  py: "python",
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  yml: "yaml",
  md: "markdown",
  plaintext: "text",
  plain: "text",
  txt: "text",
  none: "text",
};

/** Maps user/legacy language values to a language the highlighter can render. */
export function normalizeCodeLanguage(value?: string | null): string {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return DEFAULT_CODE_LANGUAGE;

  const aliased = ALIASES[raw] ?? raw;
  return CODE_LANGUAGES.some((l) => l.id === aliased)
    ? aliased
    : DEFAULT_CODE_LANGUAGE;
}

/** Human readable name shown on the code block header. */
export function codeLanguageLabel(value?: string | null): string {
  const id = normalizeCodeLanguage(value);
  return CODE_LANGUAGES.find((l) => l.id === id)?.label ?? id;
}
