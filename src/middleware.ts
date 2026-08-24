import { defineMiddleware } from "astro:middleware";
import type { SupportedLanguage } from "./i18n/i18n";

export const onRequest = defineMiddleware(async (context, next) => {
  const supported: SupportedLanguage[] = ["en", "es", "fr"];
  const { pathname } = context.url;

  if (pathname.startsWith("/api")) {
    return next();
  }

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

  const { lang: pathLang } = context.params as {
    lang: SupportedLanguage;
  };

  if (pathLang && !supported.includes(pathLang)) {
    return context.redirect("/404");
  }

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
