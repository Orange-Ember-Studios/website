import { createElement, createEffect, createSignal, navigate } from "@emberkit/core";
import { MilkdownField } from "./MilkdownField.tsx";
import { IconChevronLeft } from "@emberkit/icons";
/** CDN paths under Orange-Ember-Studios/cdn-resources (see SITE_URLS.CDN_BASE). */
const CDN_IMAGE_OPTIONS = {
  blog: [
    "/blog/astro-islands.jpg",
    "/blog/exact-slice-accuracy.jpg",
    "/blog/gaming-future.jpg",
    "/blog/inverse-pulse-creation.jpg",
    "/blog/micro-interactions-godot.jpg",
    "/blog/studio-founding.jpg",
  ],
  projects: [
    "/projects/photo-1504384308090-c894fdcc538d.avif",
    "/projects/photo-1512941937669-90a1b58e7e9c.avif",
    "/projects/photo-1542751371-adc38448a05e.avif",
    "/projects/photo-1550745165-9bc0b252726f.avif",
  ],
} as const;

const LANGS = ["en", "es", "fr"] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

const PROJECT_CATEGORIES = [
  "Desktop Game",
  "Mobile Game",
  "Web App",
  "Tool",
  "Library",
  "Other",
];

const PROJECT_STATUSES = [
  "In Development",
  "Released",
  "Beta",
  "Archived",
];

interface TranslationData {
  title: string;
  content: string;
  published: boolean;
}

interface PostEditorProps {
  postId: string | null;
  type: "blog" | "project" | "case_study";
  section: string;
}

let editorUid = 0;
function nextRootId(prefix: string) {
  editorUid += 1;
  return `${prefix}-${editorUid}`;
}

export default function PostEditor(props: PostEditorProps) {
  const isNew = props.postId === null;

  const [loading, setLoading] = createSignal(!isNew);
  const [saving, setSaving] = createSignal(false);
  const [activeLang, setActiveLang] = createSignal<Lang>("en");
  const [saveError, setSaveError] = createSignal("");
  const [saveSuccess, setSaveSuccess] = createSignal("");

  const [slug, setSlug] = createSignal("");
  const [author, setAuthor] = createSignal("");
  const [image, setImage] = createSignal("");

  const emptyTranslations = (): Record<Lang, TranslationData> => ({
    en: { title: "", content: "", published: props.type === "blog" },
    es: { title: "", content: "", published: false },
    fr: { title: "", content: "", published: false },
  });

  const [translations, setTranslations] =
    createSignal<Record<Lang, TranslationData>>(emptyTranslations());

  const milkdownGetters: Record<string, (() => string) | null> = {};
  const milkdownSetters: Record<string, ((md: string) => void) | null> = {};

  const contentRootIds: Record<Lang, string> = {
    en: nextRootId("editor-content-en"),
    es: nextRootId("editor-content-es"),
    fr: nextRootId("editor-content-fr"),
  };
  const descRootIds: Record<Lang, string> = {
    en: nextRootId("editor-description-en"),
    es: nextRootId("editor-description-es"),
    fr: nextRootId("editor-description-fr"),
  };

  function parseProjectContent(content: string) {
    try {
      const parsed = JSON.parse(content || "{}");
      return {
        category: parsed.category || "Desktop Game",
        status: parsed.status || "In Development",
        description: parsed.description || "",
        link: parsed.link || "",
      };
    } catch {
      return {
        category: "Desktop Game",
        status: "In Development",
        description: "",
        link: "",
      };
    }
  }

  function readCurrentFormValues(): Partial<TranslationData> {
    const lang = activeLang();
    const titleEl = document.querySelector<HTMLInputElement>(
      `input[name="title-${lang}"]`,
    );
    const pubEl = document.querySelector<HTMLInputElement>(
      `input[name="published-${lang}"]`,
    );
    const partial: Partial<TranslationData> = {};
    if (titleEl) partial.title = titleEl.value;
    if (pubEl) partial.published = pubEl.checked;
    return partial;
  }

  function flushMilkdownContent(lang: Lang): string | undefined {
    const key =
      props.type === "project"
        ? `desc-${lang}`
        : `content-${lang}`;
    const getter = milkdownGetters[key];
    if (getter) {
      try {
        return getter();
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  function storeCurrentLang() {
    const lang = activeLang();
    const formVals = readCurrentFormValues();
    const md = flushMilkdownContent(lang);

    setTranslations((prev) => {
      const cur = prev[lang];
      const updated = { ...cur };
      if (formVals.title !== undefined) updated.title = formVals.title;
      if (formVals.published !== undefined)
        updated.published = formVals.published;
      if (md !== undefined) updated.content = md;
      return { ...prev, [lang]: updated };
    });
  }

  function populateFormFields() {
    requestAnimationFrame(() => {
      const slugEl = document.querySelector<HTMLInputElement>('input[name="slug"]');
      if (slugEl) slugEl.value = slug();

      const authorEl = document.querySelector<HTMLInputElement>('input[name="author"]');
      if (authorEl) authorEl.value = author();

      const imageEl = document.querySelector<HTMLInputElement>('input[name="image"]');
      if (imageEl) imageEl.value = image();

      const t = translations();
      for (const lang of LANGS) {
        populateLangFields(lang);

        const data = t[lang];
        if (props.type === "project") {
          const meta = parseProjectContent(data.content);
          const setter = milkdownSetters[`desc-${lang}`];
          if (setter) setter(meta.description);
        } else {
          const setter = milkdownSetters[`content-${lang}`];
          if (setter) setter(data.content);
        }
      }
    });
  }

  function populateLangFields(lang: Lang) {
    const t = translations();
    const data = t[lang];
    if (!data) return;

    requestAnimationFrame(() => {
      const titleEl = document.querySelector<HTMLInputElement>(`input[name="title-${lang}"]`);
      if (titleEl) titleEl.value = data.title;

      const pubEl = document.querySelector<HTMLInputElement>(`input[name="published-${lang}"]`);
      if (pubEl) pubEl.checked = data.published;

      if (props.type === "project") {
        const meta = parseProjectContent(data.content);
        const catEl = document.querySelector<HTMLSelectElement>(`select[name="category-${lang}"]`);
        if (catEl) catEl.value = meta.category;
        const statusEl = document.querySelector<HTMLSelectElement>(`select[name="status-${lang}"]`);
        if (statusEl) statusEl.value = meta.status;
        const linkEl = document.querySelector<HTMLInputElement>(`input[name="link-${lang}"]`);
        if (linkEl) linkEl.value = meta.link;
      }
    });
  }

  function switchLang(lang: Lang) {
    if (lang === activeLang()) return;
    storeCurrentLang();
    setActiveLang(lang);
    populateLangFields(lang);
  }

  createEffect(() => {
    if (!props.postId) return;

    void (async () => {
      try {
        const res = await fetch(`/api/admin/posts/${props.postId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setSaveError(`Failed to load post (${res.status})`);
          setLoading(false);
          return;
        }
        const post = (await res.json()) as {
          slug: string;
          author: string;
          image: string;
          translations: Array<{
            lang: string;
            title: string;
            content: string;
            published: boolean | number;
          }>;
        };

        setSlug(post.slug);
        setAuthor(post.author);
        setImage(post.image || "");

        const t = emptyTranslations();
        for (const tr of post.translations) {
          const l = tr.lang as Lang;
          if (t[l]) {
            t[l] = {
              title: tr.title || "",
              content: tr.content || "",
              published: !!tr.published,
            };
          }
        }
        setTranslations(t);
        setLoading(false);
        populateFormFields();
      } catch {
        setSaveError("Network error loading post");
        setLoading(false);
      }
    })();
  });

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      storeCurrentLang();
      const t = translations();

      const form = document.getElementById(
        "post-editor-form",
      ) as HTMLFormElement | null;
      const fd = form ? new FormData(form) : null;

      const finalSlug = (fd?.get("slug") as string) || slug();
      const finalAuthor = (fd?.get("author") as string) || author();
      const finalImage = (fd?.get("image") as string) || image();

      const translationPayload = LANGS.map((lang) => {
        const data = t[lang];
        let content = data.content;

        if (props.type === "project") {
          const catEl = document.querySelector<HTMLSelectElement>(
            `select[name="category-${lang}"]`,
          );
          const statusEl = document.querySelector<HTMLSelectElement>(
            `select[name="status-${lang}"]`,
          );
          const linkEl = document.querySelector<HTMLInputElement>(
            `input[name="link-${lang}"]`,
          );

          const existing = parseProjectContent(data.content);
          const meta = {
            category: catEl?.value || existing.category,
            status: statusEl?.value || existing.status,
            description: existing.description,
            link: linkEl?.value || existing.link,
          };

          const freshDesc = flushMilkdownContent(lang);
          if (freshDesc !== undefined) meta.description = freshDesc;

          content = JSON.stringify(meta);
        } else {
          const freshContent = flushMilkdownContent(lang);
          if (freshContent !== undefined) content = freshContent;
        }

        const titleEl = document.querySelector<HTMLInputElement>(
          `input[name="title-${lang}"]`,
        );
        const pubEl = document.querySelector<HTMLInputElement>(
          `input[name="published-${lang}"]`,
        );

        return {
          lang,
          title: titleEl?.value ?? data.title,
          content,
          published: pubEl ? pubEl.checked : data.published,
        };
      });

      const payload = {
        ...(props.postId ? { id: props.postId } : {}),
        slug: finalSlug,
        type: props.type,
        author: finalAuthor,
        image: finalImage,
        translations: translationPayload,
      };

      const endpoint = isNew
        ? "/api/admin/posts"
        : `/api/admin/posts/${encodeURIComponent(props.postId!)}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setSaveError(errBody.error || `Save failed (${res.status})`);
        return;
      }

      setSaveSuccess("Saved successfully!");
      setTimeout(() => navigate(`/admin/${props.section}`), 600);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Network error while saving",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!props.postId) return;
    const confirmed = globalThis.confirm(
      "Are you sure you want to delete this post? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/posts/${encodeURIComponent(props.postId)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setSaveError(errBody.error || `Delete failed (${res.status})`);
        return;
      }
      navigate(`/admin/${props.section}`);
    } catch {
      setSaveError("Network error while deleting");
    }
  }

  function handleBack() {
    navigate(`/admin/${props.section}`);
  }

  const typeLabel =
    props.type === "case_study"
      ? "Case Study"
      : props.type === "project"
        ? "Project"
        : "Blog Post";

  const inputCls =
    "w-full rounded-xl border border-neutral-700 px-4 py-2.5 text-sm bg-neutral-950 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-neutral-600";
  const selectCls =
    "w-full rounded-xl border border-neutral-700 px-4 py-2.5 text-sm bg-neutral-950 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all appearance-none";
  const labelCls = "block text-sm font-medium text-neutral-400 mb-1.5";
  const sectionHeadingCls =
    "text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-5";

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Loading state */}
      <div
        data-ek-bind={loading}
        data-ek-show-when="true"
        data-ek-hide-class="hidden"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-neutral-700 border-t-orange-500 mb-4" />
            <p className="text-neutral-400 text-sm font-medium">Loading post…</p>
          </div>
        </div>
      </div>

      {/* Editor (hidden while loading for existing posts) */}
      <div
        data-ek-bind={loading}
        data-ek-show-when="false"
        data-ek-hide-class="hidden"
        className={isNew ? "" : "hidden"}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-200 text-sm mb-5 transition-colors group"
        >
          <IconChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to {props.section.replace("_", " ")}
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isNew ? "New" : "Edit"} {typeLabel}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {isNew
              ? `Create a new ${typeLabel.toLowerCase()}`
              : `Update this ${typeLabel.toLowerCase()}`}
          </p>
        </div>

        {/* Status messages */}
        {saveError() ? (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">!</span>
            {saveError()}
          </div>
        ) : null}
        {saveSuccess() ? (
          <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-semibold">✓</span>
            {saveSuccess()}
          </div>
        ) : null}

        {/* Form */}
        <form id="post-editor-form" method="POST">
          <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

            {/* Common fields */}
            <div className="p-6 md:p-8 border-b border-neutral-800">
              <h2 className={sectionHeadingCls}>General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Slug</label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={slug()}
                    placeholder="my-post-slug"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Author</label>
                  <input
                    type="text"
                    name="author"
                    defaultValue={author()}
                    placeholder="Author name"
                    className={inputCls}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Cover Image URL</label>
                  <input
                    type="text"
                    name="image"
                    defaultValue={image()}
                    list="public-images"
                    placeholder="/blog/my-image.jpg"
                    className={inputCls}
                  />
                  <datalist id="public-images">
                    <optgroup label="Blog Images">
                      {CDN_IMAGE_OPTIONS.blog.map((path) => (
                        <option key={path} value={path} />
                      ))}
                    </optgroup>
                    <optgroup label="Project Images">
                      {CDN_IMAGE_OPTIONS.projects.map((path) => (
                        <option key={path} value={path} />
                      ))}
                    </optgroup>
                  </datalist>
                </div>
              </div>
            </div>

            {/* Language tabs */}
            <div className="px-6 md:px-8 pt-5 pb-4 border-b border-neutral-800">
              <div className="flex gap-1 bg-neutral-800/80 rounded-xl p-1 w-fit">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => switchLang(l)}
                    data-ek-bind={activeLang}
                    data-ek-active-when={l}
                    data-ek-active-class="bg-orange-500 text-white font-semibold shadow-sm"
                    data-ek-inactive-class="text-neutral-400 hover:text-white"
                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all text-neutral-400"
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-language panels — all rendered, toggled via data-ek-bind */}
            {LANGS.map((l) => {
              const t = translations();
              const current = t[l];
              const projectMeta =
                props.type === "project"
                  ? parseProjectContent(current.content)
                  : null;
              const milkdownInitial =
                props.type === "project"
                  ? projectMeta?.description ?? ""
                  : current.content;

              return (
                <div
                  key={l}
                  data-ek-bind={activeLang}
                  data-ek-show-when={l}
                  data-ek-hide-class="hidden"
                  className={l === "en" ? "" : "hidden"}
                >
                  <div className="p-6 md:p-8">
                    <h2 className={sectionHeadingCls}>
                      Content — {LANG_LABELS[l]}
                    </h2>

                    <div className="space-y-5">
                      {/* Title */}
                      <div>
                        <label className={labelCls}>Title</label>
                        <input
                          type="text"
                          name={`title-${l}`}
                          defaultValue={current.title}
                          placeholder="Post title"
                          className={inputCls}
                        />
                      </div>

                      {/* Published toggle */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name={`published-${l}`}
                          id={`published-${l}`}
                          defaultChecked={current.published}
                          className="h-4 w-4 rounded border-neutral-600 bg-neutral-950 text-orange-500 focus:ring-orange-500 accent-orange-500"
                        />
                        <label
                          htmlFor={`published-${l}`}
                          className="text-sm font-medium text-neutral-300 select-none"
                        >
                          Published
                        </label>
                      </div>
                      {props.type === "blog" ? (
                        <p className="text-xs text-neutral-500 -mt-2">
                          Only published translations appear on the public blog
                          ({`/${l}/blog`}).
                        </p>
                      ) : null}

                      {/* Type-specific fields */}
                      {props.type === "project" ? (
                        <div className="space-y-5 pt-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className={labelCls}>Category</label>
                              <select
                                name={`category-${l}`}
                                defaultValue={projectMeta?.category}
                                className={selectCls}
                              >
                                {PROJECT_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Status</label>
                              <select
                                name={`status-${l}`}
                                defaultValue={projectMeta?.status}
                                className={selectCls}
                              >
                                {PROJECT_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className={labelCls}>Link</label>
                            <input
                              type="url"
                              name={`link-${l}`}
                              defaultValue={projectMeta?.link}
                              placeholder="https://example.com/project"
                              className={inputCls}
                            />
                          </div>

                          <div>
                            <label className={labelCls}>Description</label>
                            <MilkdownField
                              rootId={descRootIds[l]}
                              langKey={`desc-${l}`}
                              initialMarkdown={milkdownInitial}
                              onMarkdownChange={(md) => {
                                setTranslations((prev) => {
                                  const existing = parseProjectContent(
                                    prev[l].content,
                                  );
                                  existing.description = md;
                                  return {
                                    ...prev,
                                    [l]: {
                                      ...prev[l],
                                      content: JSON.stringify(existing),
                                    },
                                  };
                                });
                              }}
                              registerGetMarkdown={(fn) => {
                                milkdownGetters[`desc-${l}`] = fn;
                              }}
                              registerSetMarkdown={(fn) => {
                                milkdownSetters[`desc-${l}`] = fn;
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className={labelCls}>Content</label>
                          <MilkdownField
                            rootId={contentRootIds[l]}
                            langKey={`content-${l}`}
                            initialMarkdown={milkdownInitial}
                            onMarkdownChange={(md) => {
                              setTranslations((prev) => ({
                                ...prev,
                                [l]: { ...prev[l], content: md },
                              }));
                            }}
                            registerGetMarkdown={(fn) => {
                              milkdownGetters[`content-${l}`] = fn;
                            }}
                            registerSetMarkdown={(fn) => {
                              milkdownSetters[`content-${l}`] = fn;
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div className="px-6 md:px-8 py-5 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between">
              <div>
                {!isNew ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-orange-500/25"
                >
                  {saving() ? "Saving…" : isNew ? "Create" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
