import {
  createEffect,
  createSignal,
  getCached,
  setCache,
} from "@emberkit/core";
import { getTranslation, getCurrentLanguage } from "../../i18n/i18n.ts";
import { resolveImageUrl } from "../../lib/images.ts";
import { getTagStyle } from "./tagMetadata.ts";
import {
  type BlogListPost,
  blogListCacheKey,
  escHtml,
  formatBlogCardDate,
  ICON_ARROW_RIGHT_SVG,
  postLang,
} from "./blog-shared.ts";

const GRID_ROOT_ID = "blog-index-grid";

function getSortOrder(): string {
  if (typeof window === "undefined") return "desc";
  return new URLSearchParams(window.location.search).get("sort") || "desc";
}

function renderPostCard(
  post: BlogListPost,
  lang: string,
  readStory: string,
): string {
  const pl = postLang(post.id);
  const slugForHref = post.id.replace(`${pl}/`, "");
  const href = `/${lang}/blog/${encodeURIComponent(slugForHref)}`;
  const tags = post.data.tags?.length
    ? post.data.tags
    : post.data.meta?.tags || [];
  const dateStr = formatBlogCardDate(post.data.pubDate, lang);
  const tagHtml = tags
    .slice(0, 3)
    .map(
      (tag) =>
        `<span class="${getTagStyle(tag)}"><span data-tag-id="${escHtml(tag)}">${escHtml(tag)}</span></span>`,
    )
    .join("");
  const imageBlock = post.data.image
    ? `<div class="aspect-16/10 overflow-hidden"><img src="${escHtml(resolveImageUrl(post.data.image))}" alt="${escHtml(post.data.title)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /></div>`
    : "";

  return `<a href="${href}" class="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(249,115,22,0.2)] block">${imageBlock}<div class="p-8"><div class="flex flex-wrap items-center gap-2 mb-4">${tagHtml}<span class="text-xs text-gray-500 ml-auto">${escHtml(dateStr)}</span></div><h2 class="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-orange-400 transition-colors">${escHtml(post.data.title)}</h2><p class="text-gray-400 line-clamp-3 mb-6 text-sm leading-relaxed">${escHtml(post.data.description)}</p><div class="flex items-center text-white font-bold text-sm group-hover:translate-x-1 transition-transform"><span data-i18n="blog.readStory">${escHtml(readStory)}</span>${ICON_ARROW_RIGHT_SVG}</div></div></a>`;
}

function renderGrid(posts: BlogListPost[], lang: string, readStory: string) {
  const root = document.getElementById(GRID_ROOT_ID);
  if (!root) return;

  if (posts.length === 0) {
    root.innerHTML = `<p class="text-center text-gray-500 col-span-full py-16 text-lg">${escHtml(getTranslation("blog.indexDescription", lang))}</p>`;
    return;
  }

  root.innerHTML = posts
    .map((post) => renderPostCard(post, lang, readStory))
    .join("");
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden animate-pulse">
      <div className="aspect-16/10 bg-white/10" />
      <div className="p-8 space-y-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-8 w-full bg-white/10 rounded" />
        <div className="h-16 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
}

export type BlogIndexProps = {
  lang?: string;
};

export function BlogIndex(props: BlogIndexProps) {
  const lang = props.lang || getCurrentLanguage();
  const sortOrder = getSortOrder();
  const cacheKey = blogListCacheKey(lang, sortOrder);
  const cachedOnMount = getCached(cacheKey) as BlogListPost[] | null;
  const initiallyLoading = cachedOnMount === null;

  const loadingSig = createSignal(initiallyLoading);
  const loading = loadingSig[0];
  const setLoading = loadingSig[1];

  const postsSig = createSignal<BlogListPost[]>(cachedOnMount ?? []);

  createEffect(() => {
    const l = props.lang || getCurrentLanguage();
    const sort = getSortOrder();
    const key = blogListCacheKey(l, sort);

    void (async () => {
      let list = getCached(key) as BlogListPost[] | null;
      if (list !== null) {
        postsSig.value = list;
        setLoading(false);
        renderGrid(list, l, getTranslation("blog.readStory", l));
      }

      try {
        const res = await fetch(
          `/api/blog/list?lang=${encodeURIComponent(l)}&sort=${encodeURIComponent(sort)}`,
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = (await res.json()) as BlogListPost[];
        list = Array.isArray(data) ? data : [];
        setCache(key, list);
        postsSig.value = list;
        renderGrid(list, l, getTranslation("blog.readStory", l));
      } catch (err) {
        console.error("[BlogIndex] Fetch error:", err);
        if (list === null) {
          postsSig.value = [];
          renderGrid([], l, getTranslation("blog.readStory", l));
        }
      } finally {
        setLoading(false);
      }
    })();
  });

  createEffect(() => {
    const unsub = postsSig.subscribe(() => {
      const l = props.lang || getCurrentLanguage();
      renderGrid(
        postsSig.peek(),
        l,
        getTranslation("blog.readStory", l),
      );
    });
    return () => unsub();
  });

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <header className="mb-20 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 tracking-tight">
          <span data-i18n="blog.indexTitlePrefix">
            {getTranslation("blog.indexTitlePrefix", lang)}
          </span>
          <span
            className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600"
            data-i18n="blog.indexTitleHighlight"
          >
            {getTranslation("blog.indexTitleHighlight", lang)}
          </span>
          <span data-i18n="blog.indexTitleSuffix">
            {getTranslation("blog.indexTitleSuffix", lang)}
          </span>
        </h1>
        <p
          className="text-xl text-gray-400 max-w-2xl mx-auto"
          data-i18n="blog.indexDescription"
        >
          {getTranslation("blog.indexDescription", lang)}
        </p>
      </header>

      <div
        data-ek-bind={loading}
        data-ek-show-when="true"
        data-ek-hide-class="hidden"
        className={initiallyLoading ? "" : "hidden"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      <div
        data-ek-bind={loading}
        data-ek-show-when="false"
        data-ek-hide-class="hidden"
        className={initiallyLoading ? "hidden" : ""}
      >
        <div
          id={GRID_ROOT_ID}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        />
      </div>
    </main>
  );
}

export default BlogIndex;
