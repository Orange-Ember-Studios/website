import { createEffect, useNavigate } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";
import { detectLangFromRequest } from "../lib/lang.js";
import { getSupportedLanguages } from "../i18n/i18n.ts";

const FALLBACK_LANG = "en";

function pickLangFromRequest(request: Request): string {
  try {
    return detectLangFromRequest(request);
  } catch {
    return FALLBACK_LANG;
  }
}

const RootRedirect: RouteComponent<{
  params?: Record<string, string>;
  request?: Request;
}> = ({ request }) => {
  const navigate = useNavigate();

  let target = `/${FALLBACK_LANG}/`;
  if (request) {
    target = `/${pickLangFromRequest(request)}/`;
  } else if (typeof window !== "undefined") {
    const supported = getSupportedLanguages().map((l) => l.code);
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("x-language="))
      ?.split("=")[1];
    let lang = FALLBACK_LANG;
    if (cookie && supported.includes(cookie as typeof supported[number])) {
      lang = cookie;
    } else {
      const al = navigator.language.toLowerCase();
      if (al.includes("es")) lang = "es";
      else if (al.includes("fr")) lang = "fr";
    }
    target = `/${lang}/`;
  }

  if (typeof window !== "undefined") {
    createEffect(() => {
      window.location.replace(target);
    });
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400">
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <p>Redirecting…</p>
    </div>
  );
};

export default RootRedirect;
