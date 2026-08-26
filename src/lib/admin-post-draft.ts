import { EMPTY_EDITOR_JS } from "./editorjs-content.ts";

export const ADMIN_DRAFT_LANGS = ["en", "es", "fr"] as const;

export interface AdminDraftTranslation {
  lang: string;
  title: string;
  content: string;
  published: boolean;
}

export interface AdminPostDraftData {
  id: string;
  slug: string;
  type: string;
  author: string;
  image: string;
  translations: AdminDraftTranslation[];
}

function emptyTranslations(): AdminDraftTranslation[] {
  return ADMIN_DRAFT_LANGS.map((lang) => ({
    lang,
    title: "",
    content: EMPTY_EDITOR_JS,
    published: false,
  }));
}

/** Blank draft used by the `/admin/{section}/new` route. */
export function emptyAdminPostDraft(type: string): AdminPostDraftData {
  return {
    id: "new",
    slug: "",
    type,
    author: "",
    image: "",
    translations: emptyTranslations(),
  };
}

/**
 * Normalizes an `/api/admin/posts/:id` row (post + translations) into the shape
 * the editor expects, always exposing one translation per supported language.
 */
export function toAdminPostDraft(
  row: Record<string, unknown> | null | undefined,
  fallbackType: string,
): AdminPostDraftData {
  if (!row) return emptyAdminPostDraft(fallbackType);

  const stored = Array.isArray(row.translations)
    ? (row.translations as Array<Record<string, unknown>>)
    : [];

  return {
    id: String(row.id ?? "new"),
    slug: String(row.slug ?? ""),
    type: String(row.type ?? fallbackType),
    author: String(row.author ?? ""),
    image: row.image == null ? "" : String(row.image),
    translations: ADMIN_DRAFT_LANGS.map((lang) => {
      const t = stored.find((item) => String(item?.lang) === lang);
      const content = String(t?.content ?? "").trim();
      return {
        lang,
        title: String(t?.title ?? ""),
        content: content || EMPTY_EDITOR_JS,
        published: Boolean(t?.published),
      };
    }),
  };
}

/**
 * Returns a copy of the draft with the publish flag of a single language
 * changed, adding the translation when it does not exist yet.
 */
export function setDraftTranslationPublished(
  draft: AdminPostDraftData,
  lang: string,
  published: boolean,
): AdminPostDraftData {
  const exists = draft.translations.some((t) => t.lang === lang);
  const translations = exists
    ? draft.translations.map((t) => (t.lang === lang ? { ...t, published } : t))
    : [
        ...draft.translations,
        { lang, title: "", content: EMPTY_EDITOR_JS, published },
      ];

  return { ...draft, translations };
}

/**
 * Deep-copies a draft without `structuredClone`, which throws `DataCloneError`
 * when it receives a reactive proxy (the shape the editor gets as a prop).
 */
export function cloneAdminPostDraft(
  draft: AdminPostDraftData,
): AdminPostDraftData {
  return {
    id: draft.id,
    slug: draft.slug,
    type: draft.type,
    author: draft.author,
    image: draft.image,
    translations: draft.translations.map((t) => ({
      lang: t.lang,
      title: t.title,
      content: t.content,
      published: Boolean(t.published),
    })),
  };
}
