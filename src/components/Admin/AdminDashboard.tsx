import {
  createEffect,
  createSignal,
  createElement,
  navigate,
  renderToHTMLString,
} from "@emberkit/core";
import { getHandler } from "../../../node_modules/@emberkit/core/dist/runtime/helpers/render.js";
import { getTranslation } from "../../i18n/i18n.ts";
import AdminEditor, { type AdminPostDraft } from "./AdminEditor.tsx";
import AdminProfile from "./AdminProfile.tsx";
import {
  IconBook,
  IconFile,
  IconImage,
  IconLogOut,
  IconUser,
} from "@emberkit/icons";

export type AdminSection = "blog" | "project" | "case_study" | "profile";

type PostSummary = {
  id: string;
  slug: string;
  type: string;
  created_at: string;
};

function sectionTitleKey(section: AdminSection): string {
  if (section === "blog") return "admin.dashboard.blogPosts";
  if (section === "project") return "admin.dashboard.portfolio";
  if (section === "case_study") return "admin.dashboard.caseStudies";
  return "admin.dashboard.profile";
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function attachEkClickHandlers(root: HTMLElement) {
  root.querySelectorAll("[data-ekclick]").forEach((el) => {
    const id = el.getAttribute("data-ekclick");
    if (!id) return;
    const handler = getHandler(id);
    if (handler) {
      el.addEventListener("click", handler);
      el.removeAttribute("data-ekclick");
    }
  });
}

export default function AdminDashboard(props: {
  section: AdminSection;
  postId?: string;
}) {
  const authState = createSignal(false);
  const authChecked = authState[0];
  const setAuthChecked = authState[1];

  const loadingState = createSignal(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];

  const postsState = createSignal<PostSummary[]>([]);
  const setPosts = (next: PostSummary[]) => {
    postsState.value = next;
  };

  const editingState = createSignal<AdminPostDraft | null>(null);
  const setEditingPost = (
    next: AdminPostDraft | null | ((prev: AdminPostDraft | null) => AdminPostDraft | null),
  ) => {
    if (typeof next === "function") {
      editingState.value = (next as (p: AdminPostDraft | null) => AdminPostDraft | null)(
        editingState.peek(),
      );
    } else {
      editingState.value = next;
    }
  };

  let postListDelegationBound = false;

  const normalizePost = (postDetails: AdminPostDraft): AdminPostDraft => {
    const targetLangs = ["en", "es", "fr"];
    const translations = targetLangs.map((lang) => {
      return (
        postDetails.translations?.find((t) => t.lang === lang) || {
          lang,
          title: "",
          content: '{"blocks":[]}',
          published: false,
        }
      );
    });
    return { ...postDetails, translations };
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", { credentials: "same-origin" });
      if (!res.ok) {
        console.error("Failed to fetch posts:", res.status);
        setPosts([]);
        return;
      }
      const data = await res.json();
      setPosts(Array.isArray(data) ? (data as PostSummary[]) : []);
    } catch (e) {
      console.error("Error fetching posts:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const goSection = (section: AdminSection) => {
    navigate(`/admin/${section}`);
  };

  const closeEditor = () => {
    setEditingPost(null);
    navigate(`/admin/${props.section}`);
  };

  const refreshPosts = () => {
    setEditingPost(null);
    navigate(`/admin/${props.section}`);
    void fetchPosts();
  };

  const syncPostList = () => {
    const root = document.getElementById("admin-post-list-root");
    if (!root || props.section === "profile") return;

    const filtered = postsState.peek().filter(
      (p) => p.type === props.section && props.section !== "profile",
    );

    if (!postListDelegationBound) {
      postListDelegationBound = true;
      root.addEventListener("click", (e) => {
        const t = (e.target as HTMLElement).closest("[data-admin-create-first]");
        if (t) {
          e.preventDefault();
          createNewPost();
        }
      });
    }

    if (filtered.length === 0) {
      root.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-neutral-500 gap-2 border-2 border-dashed border-neutral-800 rounded-2xl text-center px-4">
          <p>${escHtml(getTranslation("admin.dashboard.noContent"))}</p>
          <button type="button" data-admin-create-first class="text-orange-500 hover:underline text-sm font-medium">
            ${escHtml(getTranslation("admin.dashboard.createFirst"))}
          </button>
        </div>`;
      return;
    }

    const cards = filtered
      .map(
        (post) => `
        <a
          href="/admin/${props.section}/${encodeURIComponent(post.id)}"
          class="text-left bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors cursor-pointer group flex flex-col justify-between p-4 md:p-5 shadow-sm"
        >
          <div>
            <div class="flex justify-between items-start mb-3 md:mb-4">
              <span class="px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider rounded-md bg-neutral-800 text-neutral-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                ${escHtml(post.type)}
              </span>
              <span class="text-[10px] md:text-xs text-neutral-500">
                ${escHtml(new Date(post.created_at).toLocaleDateString())}
              </span>
            </div>
            <h3 class="text-base md:text-lg font-medium text-white mb-2 line-clamp-2">
              ${escHtml(post.slug)}
            </h3>
          </div>
          <div class="flex items-center gap-2 mt-3 md:mt-4 text-[10px] md:text-xs font-medium text-neutral-500 group-hover:text-orange-400 transition-colors">
            <span>${escHtml(getTranslation("admin.dashboard.editContent"))}</span>
          </div>
        </a>`,
      )
      .join("");

    root.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">${cards}</div>`;
  };

  const syncEditorSlot = () => {
    const slot = document.getElementById("admin-editor-slot");
    if (!slot) return;
    const draft = editingState.peek();
    if (!draft) {
      slot.innerHTML = "";
      return;
    }
    const html = renderToHTMLString(
      createElement(AdminEditor as never, {
        post: draft,
        onClose: closeEditor,
        onSaved: refreshPosts,
      }),
    );
    slot.innerHTML = html;
    attachEkClickHandlers(slot);
  };

  const createNewPost = () => {
    setEditingPost({
      id: "new",
      slug: "new-url",
      type: props.section === "profile" ? "blog" : props.section,
      author: "Orange Ember",
      image: "",
      translations: [
        { lang: "en", title: "", content: '{"blocks":[]}', published: false },
        { lang: "es", title: "", content: '{"blocks":[]}', published: false },
        { lang: "fr", title: "", content: '{"blocks":[]}', published: false },
      ],
    });
  };

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAuthChecked(true);
        await fetchPosts();

        const id = props.postId;
        if (id && props.section !== "profile") {
          try {
            const pr = await fetch(`/api/admin/posts/${encodeURIComponent(id)}`, {
              credentials: "same-origin",
            });
            if (pr.ok) {
              const postDetails = (await pr.json()) as AdminPostDraft;
              setEditingPost(normalizePost(postDetails));
            } else {
              setEditingPost(null);
            }
          } catch (e) {
            console.error(e);
            setEditingPost(null);
          }
        } else {
          setEditingPost(null);
        }
      } catch {
        navigate("/admin/login", { replace: true });
      }
    })();
  });

  createEffect(() => {
    const unsubPosts = postsState.subscribe(() => {
      syncPostList();
    });
    const unsubEditing = editingState.subscribe(() => {
      syncEditorSlot();
    });
    return () => {
      unsubPosts();
      unsubEditing();
    };
  });

  const contentTypes: { id: AdminSection; name: string }[] = [
    { id: "blog", name: "Blog" },
    { id: "project", name: "Works" },
    { id: "case_study", name: "Cases" },
  ];

  return (
    <>
      <div
        data-ek-bind={authChecked}
        data-ek-show-when="false"
        data-ek-hide-class="hidden"
        className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4" />
          <p className="text-neutral-400 text-sm">Verifying session...</p>
        </div>
      </div>

      <div
        data-ek-bind={authChecked}
        data-ek-show-when="true"
        data-ek-hide-class="hidden"
        className="min-h-screen bg-neutral-950 text-neutral-200 flex hidden"
      >
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex-col hidden md:flex">
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-xl font-bold bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              OE Studios
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => goSection(type.id)}
                className={
                  props.section === type.id
                    ? "flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all bg-orange-500/10 text-orange-400 font-medium"
                    : "flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all text-neutral-500 hover:text-white hover:bg-neutral-800"
                }
              >
                {type.id === "blog" ? (
                  <IconBook className="w-5 h-5 text-current" />
                ) : type.id === "project" ? (
                  <IconImage className="w-5 h-5 text-current" />
                ) : (
                  <IconFile className="w-5 h-5 text-current" />
                )}
                {getTranslation(sectionTitleKey(type.id))}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-neutral-800 space-y-2">
            <button
              type="button"
              onClick={() => goSection("profile")}
              className={
                props.section === "profile"
                  ? "flex items-center gap-3 px-4 py-2 rounded-lg w-full transition-all bg-orange-500/10 text-orange-400 font-medium"
                  : "flex items-center gap-3 px-4 py-2 rounded-lg w-full transition-all text-neutral-400 hover:text-white hover:bg-neutral-800"
              }
            >
              <IconUser className="w-5 h-5 text-current" />
              {getTranslation("admin.dashboard.profile")}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-3 px-4 py-2 text-neutral-400 hover:text-white w-full transition-colors group"
            >
              <IconLogOut className="w-5 h-5 text-current" />
              {getTranslation("admin.dashboard.signOut")}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
          <header className="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="md:hidden w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <span className="text-orange-500 font-bold text-xs">OE</span>
              </div>
              <h2 className="text-sm md:text-lg font-semibold capitalize truncate max-w-[150px] md:max-w-none">
                {getTranslation(sectionTitleKey(props.section))}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {props.section !== "profile" ? (
                <button
                  type="button"
                  onClick={createNewPost}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                >
                  {getTranslation("admin.dashboard.newPost")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className="md:hidden p-2 text-neutral-400 hover:text-white"
              >
                <IconLogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {props.section === "profile" ? (
              <AdminProfile />
            ) : (
              <>
                <div
                  data-ek-bind={loading}
                  data-ek-show-when="true"
                  data-ek-hide-class="hidden"
                  className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4"
                >
                  <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  {getTranslation("admin.dashboard.loading")}
                </div>
                <div
                  data-ek-bind={loading}
                  data-ek-show-when="false"
                  data-ek-hide-class="hidden"
                  className="hidden"
                >
                  <div id="admin-post-list-root" />
                </div>
              </>
            )}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around px-2 z-40">
          {[...contentTypes, { id: "profile" as const, name: "Profile" }].map(
            (type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => goSection(type.id)}
                className={
                  props.section === type.id
                    ? "flex flex-col items-center gap-1 min-w-[64px] transition-colors text-orange-500"
                    : "flex flex-col items-center gap-1 min-w-[64px] transition-colors text-neutral-500"
                }
              >
                {type.id === "blog" ? (
                  <IconBook className="w-5 h-5" />
                ) : type.id === "project" ? (
                  <IconImage className="w-5 h-5" />
                ) : type.id === "case_study" ? (
                  <IconFile className="w-5 h-5" />
                ) : (
                  <IconUser className="w-5 h-5" />
                )}
                <span className="text-[10px] font-medium tracking-tight">
                  {type.name}
                </span>
              </button>
            ),
          )}
        </nav>

        <div id="admin-editor-slot" />
      </div>
    </>
  );
}
