import {
  Head,
  createElement,
  createEffect,
  createSignal,
  getCached,
  navigate,
  setCache,
  generateArticleSchema,
} from "@emberkit/core";
import {
  IconChevronLeft,
  IconClock,
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconX,
} from "@emberkit/icons";
import { getTranslation } from "../../i18n/i18n.ts";
import type { SupportedLanguage } from "../../i18n/i18n.ts";
import { getTagStyle } from "./tagMetadata.ts";
import { resolveImageUrl } from "../../lib/images.ts";
import { SITE_URLS, SOCIAL_URLS } from "../../constants/urls.ts";
import { SUPPORTED_LANGS } from "../../server/site-env.ts";
import { setupBlogInteractions } from "./blog-interactions.ts";
import {
  type BlogPostPayload,
  blogPostCacheKey,
  formatBlogPostDate,
} from "./blog-shared.ts";

function refreshCurrentRoute() {
  const url =
    window.location.pathname + window.location.search + window.location.hash;
  navigate(url, { replace: true });
}

export type BlogPostProps = {
  lang: string;
  slug: string;
};

function PostSkeleton() {
  return (
    <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-pulse">
      <div className="h-6 w-32 bg-white/10 rounded mb-8" />
      <div className="h-16 w-full bg-white/10 rounded mb-8" />
      <div className="h-6 w-64 bg-white/10 rounded mb-12" />
      <div className="aspect-21/9 bg-white/10 rounded-4xl mb-16" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-3/4 bg-white/10 rounded" />
      </div>
    </main>
  );
}

function PostContent({
  lang,
  slug,
  post,
}: {
  lang: string;
  slug: string;
  post: BlogPostPayload;
}) {
  const { frontmatter, readingTime, htmlContent } = post;
  const {
    title,
    description,
    pubDate,
    author = "Orange Ember",
    image,
    tags = [],
  } = frontmatter;
  const resolvedImage = resolveImageUrl(image);
  const postUrl = new URL(`/${lang}/blog/${slug}`, SITE_URLS.BASE).toString();
  const encodedPostUrl = encodeURIComponent(postUrl);
  const encodedShareText = encodeURIComponent(title);
  const likeEndpoint = `/api/posts/${encodeURIComponent(lang)}/${encodeURIComponent(slug)}/likes`;
  const shareLinks = {
    x: `https://x.com/intent/tweet?url=${encodedPostUrl}&text=${encodedShareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostUrl}`,
    whatsapp: `https://wa.me/?text=${encodedShareText}%20${encodedPostUrl}`,
  };
  const formattedDate = formatBlogPostDate(pubDate, lang);
  const langKey = lang as SupportedLanguage;

  const schema = generateArticleSchema({
    title,
    description: description || "",
    author,
    publishedAt: new Date(pubDate).toISOString(),
    url: postUrl,
    image: resolvedImage,
  });

  return (
    <>
      <Head title={`${title} | Orange Ember Blog`} description={description}>
        {createElement("script", {
          type: "application/ld+json",
          dangerouslySetInnerHTML: { __html: schema },
        })}
      </Head>
      <main className="blog-post pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <a
            href={`/${lang}/blog`}
            className="inline-flex items-center text-orange-500 hover:text-orange-400 font-medium transition-colors duration-200 group"
          >
            <IconChevronLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span data-i18n="post.backToBlog">
              {getTranslation("post.backToBlog", langKey)}
            </span>
          </a>
        </div>

        <header className="mb-12 animate-fade-in">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <span key={tag} className={getTagStyle(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-8 leading-tight tracking-tight">
            {title}
          </h1>

          <div className="flex items-center space-x-6 text-gray-400">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold mr-4 shadow-xl shadow-orange-500/20 rotate-3">
                {author.charAt(0)}
              </div>
              <div>
                <p className="text-gray-100 font-semibold">{author}</p>
                <p className="text-sm">{formattedDate}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex items-center text-sm font-medium">
              <IconClock className="h-5 w-5 mr-2 text-orange-500" />
              <span>
                {getTranslation("post.estReadTime", langKey).replace(
                  "{time}",
                  readingTime.toString(),
                )}
              </span>
            </div>
          </div>
        </header>

        {resolvedImage ? (
          <div className="relative w-full aspect-21/9 rounded-4xl overflow-hidden mb-16 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] ring-1 ring-white/10">
            <img
              src={resolvedImage}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-transparent to-transparent opacity-60" />
          </div>
        ) : null}

        <article
          className="blog-content prose-premium"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <section
          className="mt-12 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
          aria-label={getTranslation("post.actions", langKey)}
        >
          <button
            type="button"
            id="blog-like-btn"
            data-like-endpoint={likeEndpoint}
            data-like-label={getTranslation("post.like", langKey)}
            data-liked-label={getTranslation("post.liked", langKey)}
            className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 font-bold text-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white disabled:cursor-default disabled:hover:translate-y-0"
            aria-pressed="false"
          >
            <IconHeart
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              data-like-icon
              aria-hidden="true"
            />
            <span data-like-label>
              {getTranslation("post.like", langKey)}
            </span>
            <span
              className="rounded-full bg-white/10 px-2.5 py-1 text-sm"
              data-like-count
            >
              0
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400">
              <IconShare className="h-4 w-4 text-orange-400" aria-hidden="true" />
              {getTranslation("post.share", langKey)}
            </span>
            <a
              href={shareLinks.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={getTranslation("post.shareX", langKey)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
            >
              <IconX className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={getTranslation("post.shareLinkedIn", langKey)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
            >
              <span className="font-bold leading-none" aria-hidden="true">
                in
              </span>
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={getTranslation("post.shareWhatsApp", langKey)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
            >
              <IconMessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </section>

        <footer className="mt-20 pt-10 border-t border-white/5">
          <div className="bg-linear-to-br from-white/5 to-transparent rounded-4xl p-8 sm:p-12 border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h3
                  className="text-2xl font-bold text-white mb-2"
                  data-i18n="post.enjoyedPost"
                >
                  {getTranslation("post.enjoyedPost", langKey)}
                </h3>
                <p className="text-gray-400" data-i18n="post.stayUpdated">
                  {getTranslation("post.stayUpdated", langKey)}
                </p>
              </div>
              <div className="flex gap-4">
                <a
                  href={SOCIAL_URLS.TWITTER_X}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                  <span data-i18n="post.followX">
                    {getTranslation("post.followX", langKey)}
                  </span>
                  <IconX className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

export function BlogPost(props: BlogPostProps) {
  const { lang, slug } = props;
  const cacheKey = blogPostCacheKey(lang, slug);
  const cachedOnMount = getCached(cacheKey) as BlogPostPayload | null;
  const initiallyLoading = cachedOnMount === null;

  const loadingSig = createSignal(initiallyLoading);
  const loading = loadingSig[0];
  const setLoading = loadingSig[1];
  const postSig = createSignal<BlogPostPayload | null>(cachedOnMount);
  const post = postSig[0];
  const setPost = postSig[1];

  createEffect(() => {
    if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
      navigate("/404", { replace: true });
      return;
    }

    const key = blogPostCacheKey(lang, slug);
    let cancelled = false;

    void (async () => {
      let payload = getCached(key) as BlogPostPayload | null;
      const fetchedFromNetwork = payload === null;

      if (payload !== null) {
        setPost(payload);
        setLoading(false);
      }

      if (payload === null) {
        try {
          const res = await fetch(
            `/api/blog/${encodeURIComponent(lang)}/${encodeURIComponent(slug)}`,
          );
          if (cancelled) return;
          if (!res.ok) {
            navigate("/404", { replace: true });
            return;
          }
          payload = (await res.json()) as BlogPostPayload;
          setCache(key, payload);
          setPost(payload);
        } catch (err) {
          console.error("[BlogPost] Fetch error:", err);
          if (!cancelled) navigate("/404", { replace: true });
          return;
        }
      }

      if (cancelled) return;

      if (fetchedFromNetwork && payload) {
        refreshCurrentRoute();
        return;
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  });

  // Setup like button using proven login pattern
  createEffect(() => {
    if (!post() || loading()) return;

    let btn: HTMLButtonElement | null = null;
    let onClick: ((e: MouseEvent) => void) | null = null;

    const raf = requestAnimationFrame(() => {
      console.log("[like] Looking for button...");
      btn = document.getElementById("blog-like-btn") as HTMLButtonElement | null;

      if (!btn) {
        console.error("[like] Button not found in DOM");
        return;
      }

      if (btn.dataset.likeWired === "true") {
        console.log("[like] Button already wired, skipping");
        return;
      }

      console.log("[like] Button found, wiring event listener");
      btn.dataset.likeWired = "true";

      const endpoint = btn.dataset.likeEndpoint;
      if (!endpoint) {
        console.error("[like] Missing data-like-endpoint");
        return;
      }

      const labels = {
        like: btn.dataset.likeLabel ?? "Like",
        liked: btn.dataset.likedLabel ?? "Liked",
      };

      // Initial fetch to get like status
      console.log("[like] Fetching initial status from:", endpoint);
      void fetch(endpoint, { credentials: "include" })
        .then((response) => {
          console.log("[like] Initial fetch response:", response.status);
          return response.ok ? response.json() : null;
        })
        .then((payload: { count: number; liked: boolean } | null) => {
          console.log("[like] Initial payload:", payload);
          if (payload && btn) {
            const countEl = btn.querySelector("[data-like-count]");
            const labelEl = btn.querySelector("[data-like-label]");
            const iconEl = btn.querySelector("[data-like-icon]");

            if (countEl) countEl.textContent = String(payload.count);
            if (labelEl) labelEl.textContent = payload.liked ? labels.liked : labels.like;

            btn.disabled = payload.liked;
            btn.setAttribute("aria-pressed", payload.liked ? "true" : "false");

            btn.classList.toggle("bg-orange-500", payload.liked);
            btn.classList.toggle("text-white", payload.liked);
            btn.classList.toggle("bg-orange-500/10", !payload.liked);
            btn.classList.toggle("text-orange-100", !payload.liked);
            btn.classList.toggle("hover:bg-orange-500", !payload.liked);
            btn.classList.toggle("hover:text-white", !payload.liked);

            if (iconEl) iconEl.classList.toggle("fill-current", payload.liked);
          }
        })
        .catch((error) => console.error("[like] Initial fetch error:", error));

      // Setup click handler
      onClick = (e: MouseEvent) => {
        e.preventDefault();
        console.log("[like] Click handler fired!");

        if (!btn || btn.disabled) {
          console.log("[like] Button disabled or missing, ignoring click");
          return;
        }

        const previousDisabled = btn.disabled;
        btn.disabled = true;

        console.log("[like] Sending POST to:", endpoint);
        void fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
          .then(async (response) => {
            console.log("[like] POST response status:", response.status);
            if (!response.ok) {
              const body = await response.text().catch(() => "");
              throw new Error(
                `Like request failed (${response.status})${body ? `: ${body}` : ""}`,
              );
            }
            return response.json() as Promise<{ count: number; liked: boolean }>;
          })
          .then((payload) => {
            console.log("[like] POST success, payload:", payload);
            if (!btn) return;

            const countEl = btn.querySelector("[data-like-count]");
            const labelEl = btn.querySelector("[data-like-label]");
            const iconEl = btn.querySelector("[data-like-icon]");

            if (countEl) countEl.textContent = String(payload.count);
            if (labelEl) labelEl.textContent = payload.liked ? labels.liked : labels.like;

            btn.disabled = payload.liked;
            btn.setAttribute("aria-pressed", payload.liked ? "true" : "false");

            btn.classList.toggle("bg-orange-500", payload.liked);
            btn.classList.toggle("text-white", payload.liked);
            btn.classList.toggle("bg-orange-500/10", !payload.liked);
            btn.classList.toggle("text-orange-100", !payload.liked);
            btn.classList.toggle("hover:bg-orange-500", !payload.liked);
            btn.classList.toggle("hover:text-white", !payload.liked);

            if (iconEl) iconEl.classList.toggle("fill-current", payload.liked);
          })
          .catch((error) => {
            console.error("[like] POST error:", error);
            if (btn) btn.disabled = previousDisabled;
          });
      };

      btn.addEventListener("click", onClick);
      console.log("[like] Event listener attached successfully");
    });

    // Setup copy buttons
    requestAnimationFrame(() => setupBlogInteractions());

    return () => {
      cancelAnimationFrame(raf);
      if (btn && onClick) {
        btn.removeEventListener("click", onClick);
        console.log("[like] Event listener cleaned up");
      }
    };
  });

  const currentPost = post();

  return (
    <>
      {!currentPost ? (
        <Head title="Orange Ember Blog" />
      ) : null}
      <div
        data-ek-bind={loading}
        data-ek-show-when="true"
        data-ek-hide-class="hidden"
        className={initiallyLoading ? "" : "hidden"}
      >
        <PostSkeleton />
      </div>
      <div
        data-ek-bind={loading}
        data-ek-show-when="false"
        data-ek-hide-class="hidden"
        className={initiallyLoading || currentPost === null ? "hidden" : ""}
      >
        {currentPost ? (
          <PostContent lang={lang} slug={slug} post={currentPost} />
        ) : null}
      </div>
    </>
  );
}

export default BlogPost;
