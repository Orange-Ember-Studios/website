import { createEffect, createSignal, untrack } from "@emberkit/core";
import { getTranslation } from "../../i18n/i18n.ts";
import { resolveImageUrl } from "../../lib/images.ts";
import { MilkdownField } from "./MilkdownField.tsx";
import { IconChevronDown, IconChevronLeft } from "@emberkit/icons";

type Translation = {
  lang: string;
  title: string;
  content: string;
  published: boolean;
};

export type AdminPostDraft = {
  id: string;
  slug: string;
  type: string;
  author: string;
  image: string;
  translations: Translation[];
};

let milkdownUid = 0;
function nextMilkdownId() {
  milkdownUid += 1;
  return `milkdown-field-${milkdownUid}`;
}

const LANGS = ["en", "es", "fr"] as const;

export default function AdminEditor(props: {
  post: AdminPostDraft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = createSignal<AdminPostDraft>(
    structuredClone(props.post) as AdminPostDraft,
  );
  const [activeLang, setActiveLang] = createSignal<string>("en");
  const [saving, setSaving] = createSignal(false);
  const [saveError, setSaveError] = createSignal("");
  
  const milkdownContentRef: { current: (() => string) | null } = {
    current: null,
  };
  const milkdownDescriptionRefs: { current: Record<string, (() => string) | null> } = {
    current: { en: null, es: null, fr: null },
  };
  
  const milkRootId = nextMilkdownId();
  const descriptionRootIds: Record<string, string> = {
    en: nextMilkdownId(),
    es: nextMilkdownId(),
    fr: nextMilkdownId(),
  };

  type ProjectMeta = {
    category: string;
    status: string;
    description: string;
    link: string;
  };

  const [projectMeta, setProjectMeta] = createSignal<ProjectMeta>({
    category: "Desktop Game",
    status: "In Development",
    description: "",
    link: "",
  });

  const activeTranslation = () => {
    const d = draft();
    const lang = activeLang();
    return (
      d.translations.find((t) => t.lang === lang) ?? {
        lang,
        title: "",
        content: '{"blocks":[]}',
        published: false,
      }
    );
  };

  const loadProjectMeta = () => {
    if (draft().type !== "project") return;
    const t = activeTranslation();
    try {
      const parsed = JSON.parse(t.content || "{}");
      // If description looks like JSON, extract just the description field
      let description = parsed.description || "";
      if (typeof description === "object") {
        description = "";
      }
      setProjectMeta({
        category: parsed.category || "Desktop Game",
        status: parsed.status || "In Development",
        description,
        link: parsed.link || "",
      });
    } catch {
      setProjectMeta({
        category: "Desktop Game",
        status: "In Development",
        description: "",
        link: "",
      });
    }
  };

  createEffect(() => {
    activeLang();
    if (draft().type !== "project") return;
    untrack(loadProjectMeta);
  });

  const updateTranslation = (
    lang: string,
    patch: Partial<Translation>,
  ) => {
    setDraft((d) => ({
      ...d,
      translations: d.translations.map((tr) =>
        tr.lang === lang ? { ...tr, ...patch } : tr,
      ),
    }));
  };

  const handleClose = () => props.onClose();

  const switchLang = (lang: string) => {
    setActiveLang(lang);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const form = e.target as HTMLFormElement;
      const fd = new FormData(form);

      const d = draft();

      // If blog/case_study, flush Milkdown to get latest content
      if (d.type !== "project") {
        const gm = milkdownGetMarkdownRef.current;
        if (gm) {
          try {
            const md = gm();
            updateTranslation(activeLang(), { content: md });
          } catch (e) {
            console.error("[AdminEditor] milkdown flush", e);
          }
        }
      }

      // Build payload from form data
      const postType = (fd.get("post-type") as string) || d.type;
      const payload: AdminPostDraft = {
        id: d.id,
        slug: fd.get("slug") as string || d.slug,
        author: fd.get("author") as string || d.author,
        image: fd.get("image") as string || "",
        type: postType,
        translations: LANGS.map((lang) => {
          const existing = d.translations.find((t) => t.lang === lang);
          if (lang === activeLang()) {
            // Active language: read from form
            let content = existing?.content || '{"blocks":[]}';
            if (postType === "project") {
              const meta: ProjectMeta = {
                category: fd.get(`project-category-${lang}`) as string || "Desktop Game",
                status: fd.get(`project-status-${lang}`) as string || "In Development",
                description: fd.get(`project-description-${lang}`) as string || "",
                link: fd.get(`project-link-${lang}`) as string || "",
              };
              content = JSON.stringify(meta);
            } else {
              // For blog/case_study, use Milkdown (already flushed above)
              const titleField = fd.get("post-title");
              if (titleField) {
                return {
                  lang,
                  title: titleField as string,
                  content,
                  published: existing?.published ?? false,
                };
              }
            }
            return {
              lang,
              title: fd.get("post-title") as string || existing?.title || "",
              content,
              published: existing?.published ?? false,
            };
          }
          // Inactive language: preserve existing
          return (
            existing || {
              lang,
              title: "",
              content: '{"blocks":[]}',
              published: false,
            }
          );
        }),
      };

      const endpoint =
        d.id === "new" ? "/api/admin/posts" : `/api/admin/posts/${encodeURIComponent(d.id)}`;
      const method = d.id === "new" ? "POST" : "PUT";

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

      props.onSaved();
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Network error while saving",
      );
    } finally {
      setSaving(false);
    }
  };

  // No form listener needed — use onClick on submit button instead
  const handleSaveClick = async () => {
    // Manually construct a FormData-like object from the form
    const form = document.getElementById("admin-editor-form") as HTMLFormElement;
    if (!form) {
      setSaveError("Form not found");
      return;
    }
    
    const event = new Event("submit", { bubbles: true, cancelable: true });
    const prevented = !form.dispatchEvent(event);
    if (prevented) return;
    
    await handleSubmit(event);
  };

  const tr = activeTranslation();
  const mdInitial =
    draft().type === "project" ? "" : tr.content || '{"blocks":[]}';
  const descriptionInitial = projectMeta().description;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center md:p-4">
      <div className="bg-neutral-900 border border-neutral-800 md:rounded-2xl w-full md:max-w-5xl h-full md:h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <form
          id="admin-editor-form"
          className="flex flex-col h-full"
          method="POST"
        >
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-neutral-800 flex flex-col md:flex-row md:justify-between md:items-center bg-neutral-900 gap-4">
            <div className="flex items-center gap-2 w-full md:max-w-3xl">
              <button
                type="button"
                onClick={handleClose}
                className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
                aria-label="Back"
              >
                <IconChevronLeft className="w-6 h-6" />
              </button>
              <div className="grid grid-cols-2 md:flex md:gap-4 items-center flex-1 gap-3">
                <input
                  type="text"
                  name="slug"
                  defaultValue={draft().slug}
                  placeholder={getTranslation("admin.editor.slug")}
                  className="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-1/4"
                />
                <input
                  type="text"
                  name="author"
                  defaultValue={draft().author}
                  placeholder={getTranslation("admin.editor.author")}
                  className="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-1/4"
                />
                <div className="col-span-2 md:flex-1 flex gap-2 items-center">
                  <input
                    type="text"
                    name="image"
                    defaultValue={draft().image}
                    placeholder={getTranslation("admin.editor.image")}
                    list="public-images"
                    className="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                  />
                  <datalist id="public-images">
                    <optgroup label="Blog Images">
                      <option value="/blog/astro-islands.jpg" />
                      <option value="/blog/exact-slice-accuracy.jpg" />
                      <option value="/blog/gaming-future.jpg" />
                      <option value="/blog/inverse-pulse-creation.jpg" />
                      <option value="/blog/micro-interactions-godot.jpg" />
                      <option value="/blog/studio-founding.jpg" />
                    </optgroup>
                    <optgroup label="Project Images">
                      <option value="/projects/photo-1504384308090-c894fdcc538d.avif" />
                      <option value="/projects/photo-1512941937669-90a1b58e7e9c.avif" />
                      <option value="/projects/photo-1542751371-adc38448a05e.avif" />
                      <option value="/projects/photo-1550745165-9bc0b252726f.avif" />
                    </optgroup>
                  </datalist>
                  {draft().image ? (
                    <div className="w-8 h-8 rounded bg-neutral-800 overflow-hidden border border-neutral-700 shrink-0">
                      <img
                        src={resolveImageUrl(draft().image)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="col-span-2 md:col-span-1 relative">
                  <select
                    name="post-type"
                    defaultValue={draft().type}
                    className="bg-neutral-800 border border-neutral-700 text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none text-white appearance-none w-full md:min-w-[100px]"
                  >
                    <option value="blog">
                      {getTranslation("admin.dashboard.blogPosts")}
                    </option>
                    <option value="project">
                      {getTranslation("admin.dashboard.portfolio")}
                    </option>
                    <option value="case_study">
                      {getTranslation("admin.dashboard.caseStudies")}
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <IconChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end border-t border-neutral-800 md:border-none pt-3 md:pt-0">
              {saveError() ? (
                <p className="text-red-400 text-xs self-center max-w-[200px] md:max-w-md text-right">
                  {saveError()}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs md:text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {getTranslation("admin.editor.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={saving()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg disabled:opacity-50 transition-all"
              >
                {saving()
                  ? getTranslation("admin.editor.saving")
                  : getTranslation("admin.editor.savePost")}
              </button>
            </div>
          </div>

          <div className="flex border-b border-neutral-800 bg-neutral-900/50 px-4 md:px-6 pt-1 md:pt-2 gap-1 md:gap-2 overflow-x-auto no-scrollbar">
            {LANGS.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => switchLang(lang)}
                className={
                  activeLang() === lang
                    ? "px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 border-orange-500 text-orange-400"
                    : "px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors shrink-0 border-transparent text-neutral-500 hover:text-neutral-300"
                }
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-neutral-950 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <input
                type="text"
                name="post-title"
                defaultValue={tr.title}
                placeholder={getTranslation("admin.editor.postTitle")}
                className="w-full bg-transparent text-2xl md:text-4xl font-bold text-white border-none focus:outline-none mb-6 md:mb-8 placeholder-neutral-800"
              />

              {draft().type === "project" ? (
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      {getTranslation("admin.editor.category")}
                    </label>
                    <select
                      name={`project-category-${activeLang()}`}
                      defaultValue={projectMeta().category}
                      className="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                    >
                      <option value="Desktop Game">
                        {getTranslation("admin.editor.projectCategory.desktop")}
                      </option>
                      <option value="Mobile Game">
                        {getTranslation("admin.editor.projectCategory.mobileGame")}
                      </option>
                      <option value="Mobile App">
                        {getTranslation("admin.editor.projectCategory.mobileApp")}
                      </option>
                      <option value="Web Application">
                        {getTranslation("admin.editor.projectCategory.webApp")}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      {getTranslation("admin.editor.status")}
                    </label>
                    <select
                      name={`project-status-${activeLang()}`}
                      defaultValue={projectMeta().status}
                      className="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                    >
                      <option value="Available Now">
                        {getTranslation("admin.editor.projectStatus.now")}
                      </option>
                      <option value="Coming Soon">
                        {getTranslation("admin.editor.projectStatus.soon")}
                      </option>
                      <option value="Publishing">
                        {getTranslation("admin.editor.projectStatus.publishing")}
                      </option>
                      <option value="In Development">
                        {getTranslation("admin.editor.projectStatus.dev")}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      {getTranslation("admin.editor.shortDescription")}
                    </label>
                    <MilkdownField
                      rootId={descriptionRootIds[activeLang()]}
                      langKey={`project-description-${activeLang()}`}
                      initialMarkdown={descriptionInitial}
                      onMarkdownChange={(markdown) => {
                        setProjectMeta((m) => ({ ...m, description: markdown }));
                      }}
                      registerGetMarkdown={(fn) => {
                        milkdownDescriptionRefs.current[activeLang()] = fn;
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      {getTranslation("admin.editor.externalLink")}
                    </label>
                    <input
                      type="url"
                      name={`project-link-${activeLang()}`}
                      defaultValue={projectMeta().link}
                      placeholder="https://store.steampowered.com/app/..."
                      className="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 w-full"
                    />
                  </div>
                </div>
              ) : (
                <MilkdownField
                  rootId={milkRootId}
                  langKey={`${activeLang()}-${draft().type}`}
                  initialMarkdown={tr.content || '{"blocks":[]}'}
                  onMarkdownChange={(markdown) =>
                    updateTranslation(activeLang(), { content: markdown })
                  }
                  registerGetMarkdown={(fn) => {
                    milkdownContentRef.current = fn;
                  }}
                />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
