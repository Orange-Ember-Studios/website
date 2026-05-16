import { createElement, createSignal, createEffect } from "@emberkit/core";

interface Post {
  id: string;
  slug: string;
  type: "blog" | "project" | "case_study";
  author: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostListProps {
  postType: "blog" | "project" | "case_study";
  section: string;
}

const SECTION_LABELS: Record<string, string> = {
  blog: "Blog Post",
  project: "Project",
  case_study: "Case Study",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function SkeletonCard() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 animate-pulse flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="h-5 w-20 bg-neutral-800 rounded-md" />
        <div className="h-4 w-24 bg-neutral-800 rounded-md" />
      </div>
      <div className="h-5 w-3/4 bg-neutral-800 rounded-md" />
      <div className="h-4 w-1/3 bg-neutral-800 rounded-md mt-auto" />
    </div>
  );
}

function matchesPostType(
  rowType: unknown,
  postType: PostListProps["postType"],
): boolean {
  return String(rowType ?? "").trim() === postType;
}

export default function PostList(props: PostListProps) {
  const postType = props.postType;
  const label = SECTION_LABELS[props.section] ?? props.section;
  const rootId = `postlist-grid-${props.section}`;

  const loadingSig = createSignal(true);
  const loading = loadingSig[0];
  const setLoading = loadingSig[1];

  const postsSig = createSignal<Post[]>([]);

  createEffect(() => {
    void (async () => {
      try {
        const res = await fetch(
          `/api/admin/posts?type=${encodeURIComponent(postType)}`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) {
          console.error("PostList: failed to fetch posts", res.status);
          postsSig.value = [];
          return;
        }
        const data: Post[] = await res.json();
        postsSig.value = Array.isArray(data)
          ? data.filter((p) => matchesPostType(p.type, postType))
          : [];
      } catch (e) {
        console.error("PostList: error fetching posts", e);
        postsSig.value = [];
      } finally {
        setLoading(false);
      }
    })();
  });

  createEffect(() => {
    const unsub = postsSig.subscribe(() => {
      const root = document.getElementById(rootId);
      if (!root) return;

      const filtered = postsSig.peek();

      if (filtered.length === 0) {
        root.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-700 rounded-2xl text-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-neutral-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <p class="text-neutral-500 mb-1 text-base font-medium">No ${escHtml(label.toLowerCase())}s yet</p>
            <p class="text-neutral-400 text-sm mb-5">Create your first ${escHtml(label.toLowerCase())} to get started.</p>
            <a href="/admin/${encodeURIComponent(props.section)}/new"
               class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5">
              Create ${escHtml(label)}
            </a>
          </div>`;
        return;
      }

      const cards = filtered
        .map(
          (post) => `
          <a href="/admin/${encodeURIComponent(props.section)}/${encodeURIComponent(post.id)}"
             class="bg-neutral-900 border border-neutral-800 rounded-xl hover:border-orange-500/40 transition-colors p-5 flex flex-col gap-3 group cursor-pointer">
            <div class="flex justify-between items-start">
              <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-orange-500/10 text-orange-400">
                ${escHtml(label)}
              </span>
              <span class="text-xs text-neutral-400">
                ${escHtml(formatDate(post.created_at))}
              </span>
            </div>
            <h3 class="text-base font-medium text-neutral-200 line-clamp-2 group-hover:text-orange-400 transition-colors">
              ${escHtml(post.slug)}
            </h3>
            <div class="flex items-center gap-2 mt-auto pt-2 border-t border-neutral-800 text-xs text-neutral-500 group-hover:text-orange-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Edit</span>
            </div>
          </a>`,
        )
        .join("");

      root.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>`;
    });

    return () => unsub();
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          {label}s
        </h2>
        <a
          href={`/admin/${props.section}/new`}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New {label}
        </a>
      </div>

      {/* Loading skeleton */}
      <div
        data-ek-bind={loading}
        data-ek-show-when="true"
        data-ek-hide-class="hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      {/* Loaded content (empty state or grid injected via subscription) */}
      <div
        data-ek-bind={loading}
        data-ek-show-when="false"
        data-ek-hide-class="hidden"
        className="hidden"
      >
        <div id={rootId} />
      </div>
    </div>
  );
}
