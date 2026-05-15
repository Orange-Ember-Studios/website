import { createEffect, createSignal, navigate } from "@emberkit/core";
import { getTranslation } from "../../i18n/i18n";
import AdminEditor, { type AdminPostDraft } from "./AdminEditor";
import AdminProfile from "./AdminProfile";
import {
  IconBook,
  IconFile,
  IconImage,
  IconLogOut,
  IconEdit,
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

export default function AdminDashboard(props: {
  section: AdminSection;
  postId?: string;
}) {
  const [posts, setPosts] = createSignal<PostSummary[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [authChecked, setAuthChecked] = createSignal(false);
  const [editingPost, setEditingPost] = createSignal<AdminPostDraft | null>(
    null,
  );

  // Auth guard — redirect to login if not authenticated
  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (!res.ok) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAuthChecked(true);
      } catch {
        navigate("/admin/login", { replace: true });
      }
    })();
  });

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

  // Only fetch posts once auth is confirmed
  createEffect(() => {
    if (!authChecked()) return;
    void fetchPosts();
  });

  createEffect(() => {
    if (!authChecked()) return;
    const id = props.postId;
    if (!id || props.section === "profile") {
      setEditingPost(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/admin/posts/${id}`, { credentials: "same-origin" });
        if (!res.ok || cancelled) return;
        const postDetails = (await res.json()) as AdminPostDraft;
        setEditingPost(normalizePost(postDetails));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  const filteredPosts = () =>
    posts().filter((p) => p.type === props.section && props.section !== "profile");

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const goSection = (section: AdminSection) => {
    navigate(`/admin/${section}`);
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

  const editPost = async (postSummary: PostSummary) => {
    navigate(`/admin/${props.section}/${postSummary.id}`);
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

  const contentTypes: { id: AdminSection; name: string }[] = [
    { id: "blog", name: "Blog" },
    { id: "project", name: "Works" },
    { id: "case_study", name: "Cases" },
  ];

  if (!authChecked()) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4" />
          <p className="text-neutral-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex">
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
          ) : loading() ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
              <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              {getTranslation("admin.dashboard.loading")}
            </div>
          ) : filteredPosts().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-2 border-2 border-dashed border-neutral-800 rounded-2xl text-center px-4">
              <p>{getTranslation("admin.dashboard.noContent")}</p>
              <button
                type="button"
                onClick={createNewPost}
                className="text-orange-500 hover:underline text-sm font-medium"
              >
                {getTranslation("admin.dashboard.createFirst")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredPosts().map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => void editPost(post)}
                  className="text-left bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors cursor-pointer group flex flex-col justify-between p-4 md:p-5 shadow-sm"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <span className="px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider rounded-md bg-neutral-800 text-neutral-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                        {post.type}
                      </span>
                      <span className="text-[10px] md:text-xs text-neutral-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-medium text-white mb-2 line-clamp-2">
                      {post.slug}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-3 md:mt-4 text-[10px] md:text-xs font-medium text-neutral-500 group-hover:text-orange-400 transition-colors">
                    <IconEdit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {getTranslation("admin.dashboard.editContent")}
                  </div>
                </button>
              ))}
            </div>
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

      {editingPost() ? (
        <AdminEditor
          post={editingPost()!}
          onClose={closeEditor}
          onSaved={refreshPosts}
        />
      ) : null}
    </div>
  );
}
