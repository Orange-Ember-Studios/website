import { API_URLS } from "../constants/urls";
import { loginUser } from "../lib/auth.service";
import { verifyToken } from "../lib/auth";
import { updatePassword } from "../lib/auth.service";
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPublishedPostsByType,
  getPublishedPostBySlug,
} from "../lib/posts.service";
import { getPostLikeStatus, likePost } from "../lib/post-likes.service";
import { mapPortfolioProjects } from "../lib/map-portfolio";
import type { SiteEnv, SupportedLang } from "./site-env";
import { tursoCreds } from "./site-env";

const VISITOR_COOKIE = "blog_like_visitor";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function json(data: unknown, init: ResponseInit & { cookies?: string[] } = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (init.cookies) {
    for (const c of init.cookies) headers.append("Set-Cookie", c);
  }
  const { cookies: _c, ...rest } = init;
  return new Response(JSON.stringify(data), { ...rest, headers });
}

function parseCookies(h: string | null): Record<string, string> {
  const o: Record<string, string> = {};
  if (!h) return o;
  for (const part of h.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    o[k] = decodeURIComponent(v);
  }
  return o;
}

function cookie(
  name: string,
  value: string,
  opts: {
    maxAge?: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Lax" | "Strict" | "None";
  },
) {
  let s = `${name}=${encodeURIComponent(value)}`;
  s += `; Path=${opts.path ?? "/"}`;
  if (opts.maxAge != null) s += `; Max-Age=${opts.maxAge}`;
  if (opts.httpOnly) s += "; HttpOnly";
  if (opts.secure) s += "; Secure";
  s += `; SameSite=${opts.sameSite ?? "Lax"}`;
  return s;
}

function deleteCookie(name: string) {
  return `${name}=; Path=/; Max-Age=0`;
}

function secureCookies(request: Request) {
  return request.url.startsWith("https:");
}

export async function getAdminUserFromRequest(request: Request, env: SiteEnv) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies["admin_token"];
  if (!token) return null;
  return verifyToken(token, env.JWT_SECRET);
}

export async function handleApiRequest(
  request: Request,
  env: SiteEnv,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const tc = tursoCreds(env);
  const sec = secureCookies(request);

  if (path === "/api/auth/login" && method === "POST") {
    try {
      const { username, password } = (await request.json()) as Record<
        string,
        string
      >;
      if (!username || !password) {
        return json({ error: "Missing username or password" }, { status: 400 });
      }
      const authData = await loginUser(username, password, tc, env.JWT_SECRET);
      if (!authData) {
        return json({ error: "Invalid credentials" }, { status: 401 });
      }
      const c = cookie("admin_token", authData.token, {
        path: "/",
        httpOnly: true,
        secure: sec,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24,
      });
      return json(
        {
          success: true,
          user: { username: authData.username, id: authData.userId },
        },
        { status: 200, cookies: [c] },
      );
    } catch {
      return json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (path === "/api/auth/logout" && method === "POST") {
    return json({ success: true }, { status: 200, cookies: [deleteCookie("admin_token")] });
  }

  if (path === "/api/auth/me" && method === "GET") {
    const user = await getAdminUserFromRequest(request, env);
    if (!user) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }
    return json({ user });
  }

  if (path === "/api/auth/change-password" && method === "POST") {
    const user = await getAdminUserFromRequest(request, env);
    if (!user) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }
    try {
      const { currentPassword, newPassword } = (await request.json()) as Record<
        string,
        string
      >;
      if (!currentPassword || !newPassword) {
        return json({ error: "Missing password fields" }, { status: 400 });
      }
      const result = await updatePassword(
        user.userId,
        currentPassword,
        newPassword,
        tc,
      );
      if (result.error) {
        return json({ error: result.error }, { status: 400 });
      }
      return json({ success: true });
    } catch {
      return json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (path === "/api/contact" && method === "POST") {
    try {
      const data = (await request.json()) as Record<string, string>;
      const { name, email, subject, message, token } = data;
      if (!name || !email || !subject || !message || !token) {
        return json({ error: "All fields are required." }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Invalid email address." }, { status: 400 });
      }

      // Verify Turnstile token
      if (!env.TURNSTILE_SECRET_KEY) {
        console.error("TURNSTILE_SECRET_KEY not configured");
        return json(
          { error: "Server configuration error. Please try again." },
          { status: 500 },
        );
      }

      const result = await fetch(API_URLS.TURNSTILE_VERIFY, {
        method: "POST",
        body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
        headers: { "content-type": "application/x-www-form-urlencoded" },
      });

      const turn = (await result.json()) as { success?: boolean; error_codes?: string[] };

      if (!turn.success) {
        console.warn("Turnstile verification failed:", turn.error_codes);
        return json(
          { error: "Security check failed. Please try again." },
          { status: 403 },
        );
      }

      if (!env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return json(
          {
            error:
              "Server configuration error. Please contact us via social media.",
          },
          { status: 500 },
        );
      }

      const resendResponse = await fetch(API_URLS.RESEND_EMAILS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Orange Ember Studios <contact@orangeember.com>",
          to: "hello@orangeember.com",
          reply_to: email,
          subject: `[Contact Form] ${subject}`,
          html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff5b0d;">New Inquiry from ${name}</h2>
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
        }),
      });

      const resendResult = (await resendResponse.json()) as { message?: string };

      if (!resendResponse.ok) {
        console.error("Resend API Error:", resendResult);
        throw new Error(resendResult.message || "Failed to send email via Resend");
      }

      return json({ message: "Success! Your message has been sent." });
    } catch (e) {
      console.error("Contact API Error:", e);
      return json(
        { error: "An unexpected error occurred. Please try again later." },
        { status: 500 },
      );
    }
  }

  const likesMatch = path.match(/^\/api\/posts\/([^/]+)\/([^/]+)\/likes$/);
  if (likesMatch) {
    const [, lang, slug] = likesMatch;
    const cookiesHeader = request.headers.get("cookie");
    const parsed = parseCookies(cookiesHeader);
    let visitorId = parsed[VISITOR_COOKIE];
    const outCookies: string[] = [];
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      outCookies.push(
        cookie(VISITOR_COOKIE, visitorId, {
          path: "/",
          httpOnly: true,
          secure: sec,
          sameSite: "Lax",
          maxAge: VISITOR_COOKIE_MAX_AGE,
        }),
      );
    }

    if (method === "GET") {
      try {
        const likeStatus = await getPostLikeStatus(slug, lang, visitorId);
        if (!likeStatus) return json({ error: "Post not found" }, { status: 404, cookies: outCookies });
        return json(likeStatus, { cookies: outCookies });
      } catch {
        return json({ error: "Failed to fetch likes" }, { status: 500, cookies: outCookies });
      }
    }
    if (method === "POST") {
      try {
        const likeStatus = await likePost(slug, lang, visitorId);
        if (!likeStatus) return json({ error: "Post not found" }, { status: 404, cookies: outCookies });
        return json(likeStatus, { cookies: outCookies });
      } catch {
        return json({ error: "Failed to like post" }, { status: 500, cookies: outCookies });
      }
    }
  }

  if (path === "/api/portfolio/projects" && method === "GET") {
    const lang = url.searchParams.get("lang") ?? "en";
    const dbProjects = (await getPublishedPostsByType(
      "project",
      tc,
    )) as import("../lib/map-portfolio").PortfolioPostRow[];
    return json(mapPortfolioProjects(dbProjects, lang));
  }

  const blogPostMatch = path.match(/^\/api\/blog\/([^/]+)\/([^/]+)$/);
  if (blogPostMatch && method === "GET") {
    const [, lang, slug] = blogPostMatch;
    const post = await getPublishedPostBySlug(slug, lang, tc);
    if (!post) return new Response(null, { status: 404 });
    return json({
      ...post,
      frontmatter: {
        ...post.frontmatter,
        pubDate: post.frontmatter.pubDate.toISOString(),
      },
    });
  }

  if (path === "/api/blog/list" && method === "GET") {
    const lang = url.searchParams.get("lang") ?? "en";
    const sortOrder = url.searchParams.get("sort") || "desc";
    const allPosts = await getPublishedPostsByType("blog", tc);
    const posts = allPosts.filter((p) => {
      if (lang === "en") return !p.id.startsWith("es/") && !p.id.startsWith("fr/");
      return p.id.startsWith(`${lang}/`);
    });
    posts.sort((a, b) => {
      const dateA = new Date(a.data.pubDate).getTime();
      const dateB = new Date(b.data.pubDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    return json(
      posts.map((p) => ({
        ...p,
        data: {
          ...p.data,
          pubDate: p.data.pubDate.toISOString(),
        },
      })),
    );
  }

  if (path === "/api/admin/posts") {
    const user = await getAdminUserFromRequest(request, env);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    if (method === "GET") {
      try {
        const posts = await getAllPosts(tc);
        return json(posts);
      } catch {
        return json({ error: "Failed to fetch posts" }, { status: 500 });
      }
    }
    if (method === "POST") {
      try {
        const data = (await request.json()) as any;
        if (!data.slug || !data.type || !data.author) {
          return json({ error: "Missing slug, type, or author" }, { status: 400 });
        }
        const newPost = await createPost(
          {
            slug: data.slug,
            type: data.type,
            author: data.author,
            image: data.image,
          },
          data.translations || [],
          tc,
        );
        return json(newPost, { status: 201 });
      } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
      }
    }
  }

  const adminPostIdMatch = path.match(/^\/api\/admin\/posts\/([^/]+)$/);
  if (adminPostIdMatch) {
    const user = await getAdminUserFromRequest(request, env);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });
    const id = adminPostIdMatch[1];

    if (method === "GET") {
      try {
        const post = await getPostById(id, tc);
        if (!post) return json({ error: "Post not found" }, { status: 404 });
        return json(post);
      } catch {
        return json({ error: "Server error" }, { status: 500 });
      }
    }
    if (method === "PUT") {
      try {
        const data = (await request.json()) as any;
        const updatedPost = await updatePost(
          id,
          {
            slug: data.slug,
            type: data.type,
            author: data.author,
            image: data.image,
          },
          data.translations || [],
          tc,
        );
        return json(updatedPost);
      } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
      }
    }
    if (method === "DELETE") {
      try {
        await deletePost(id, tc);
        return json({ success: true });
      } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
      }
    }
  }

  return json({ error: "Not found" }, { status: 404 });
}

export function detectLangFromRequest(request: Request): SupportedLang {
  const supported = ["en", "es", "fr"] as const;
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const cookieLang = cookies["x-language"] as SupportedLang | undefined;
  if (cookieLang && supported.includes(cookieLang)) return cookieLang;

  const acceptLang = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (acceptLang.includes("es")) return "es";
  if (acceptLang.includes("fr")) return "fr";
  return "en";
}
