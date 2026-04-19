import { defineMiddleware } from "astro:middleware";
import type { SupportedLanguage } from "./i18n/i18n";
import { verifyToken } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const supported: SupportedLanguage[] = ["en", "es", "fr"];
  const { pathname } = context.url;

  // 1. Auth Protection for Admin and API routes
  const isAdminPath = pathname.startsWith("/admin");
  const isApiAdminPath = pathname.startsWith("/api/admin");
  const isProtectedAuthPath = pathname === "/api/auth/me" || pathname === "/api/auth/change-password";

  if (isAdminPath || isApiAdminPath || isProtectedAuthPath) {
    if (pathname !== "/admin/login") {
      const token = context.cookies.get("admin_token")?.value;
      if (!token) {
        return (pathname.startsWith("/api") || isProtectedAuthPath)
          ? new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
          : context.redirect("/admin/login");
      }
      
      const decoded = await verifyToken(token);
      if (!decoded) {
        return (pathname.startsWith("/api") || isProtectedAuthPath)
          ? new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
          : context.redirect("/admin/login");
      }
      
      context.locals.user = decoded;
    }
    
    if (isAdminPath || isApiAdminPath) {
      return next(); // bypass language detection for admin dashboard
    }
  }

  // 2. Bypass public API routes
  if (pathname.startsWith("/api")) {
    return next();
  }

  const { lang: pathLang } = context.params as {
    lang: SupportedLanguage;
  };

  // 3. Handle root redirection server-side
  if (pathname === "/") {
    const cookieLang: SupportedLanguage = context.cookies.get("x-language")
      ?.value as SupportedLanguage;
    const acceptLang = context.request.headers.get("accept-language");

    let detectedLang: SupportedLanguage = "en";

    if (cookieLang && supported.includes(cookieLang)) {
      detectedLang = cookieLang;
    } else if (acceptLang) {
      if (acceptLang.toLowerCase().includes("es")) detectedLang = "es";
      else if (acceptLang.toLowerCase().includes("fr")) detectedLang = "fr";
    }

    return context.redirect(`/${detectedLang}/`);
  }

  // 4. Handle invalid language prefixes
  if (pathLang && !supported.includes(pathLang)) {
    return context.redirect("/404");
  }

  // 5. Standard language detection for other paths
  const cookieLang: SupportedLanguage = context.cookies.get("x-language")
    ?.value as SupportedLanguage;
  const lang =
    pathLang && supported.includes(pathLang)
      ? pathLang
      : cookieLang && supported.includes(cookieLang)
        ? cookieLang
        : "en";

  context.locals.lang = lang as SupportedLanguage;
  const response = await next();
  response.headers.set("X-Language", lang);

  return response;
});
