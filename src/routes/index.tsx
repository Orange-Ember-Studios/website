import { createEffect } from "@emberkit/core";
import type { RouteComponent } from "@emberkit/core";
import { getSupportedLanguages } from "../i18n/i18n.ts";

const RootRedirect: RouteComponent = () => {
  createEffect(() => {
    const supported = getSupportedLanguages().map((l) => l.code);
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("x-language="))
      ?.split("=")[1];
    let lang = "en";
    if (cookie && supported.includes(cookie)) lang = cookie;
    else {
      const al = navigator.language.toLowerCase();
      if (al.includes("es")) lang = "es";
      else if (al.includes("fr")) lang = "fr";
    }
    window.location.replace(`/${lang}/`);
  });
  return <div className="min-h-screen bg-[#0b0f19]" />;
};

export default RootRedirect;
