import en from "./translations/en.json";
import es from "./translations/es.json";
import fr from "./translations/fr.json";

export type SupportedLanguage = "en" | "es" | "fr";

const translations = {
  en,
  es,
  fr,
} as const;

const STORAGE_KEY = "oe-lang";
const COOKIE_NAME = "x-language";

export function getSupportedLanguages(): {
  code: SupportedLanguage;
  label: string;
}[] {
  return [
    { code: "en", label: "English 🇺🇸" },
    { code: "es", label: "Español 🇪🇸" },
    { code: "fr", label: "Français  🇫🇷" },
  ];
}

export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";

  const supported = getSupportedLanguages().map((l) => l.code);
  const pathname = window.location.pathname;
  const segments = pathname.split("/").filter(Boolean);

  // 1. Check URL path segments (Primary source)
  // E.g., /es/blog or /en/privacy
  if (segments[0] && supported.includes(segments[0] as any)) {
    const lang = segments[0] as SupportedLanguage;
    localStorage.setItem(STORAGE_KEY, lang);
    return lang;
  }

  // 2. Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
  if (stored && supported.includes(stored)) {
    return stored;
  }

  // 3. Fallback to browser lang
  const browser = navigator.language.split("-")[0] as SupportedLanguage;
  if (supported.includes(browser)) {
    return browser;
  }

  return "en";
}

export function setLanguage(lang: SupportedLanguage, updateUrl: boolean = false): void {
  localStorage.setItem(STORAGE_KEY, lang);
  
  // Set cookie for "custom header" simulation/server-side perception
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = lang;
    
    if (updateUrl && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/").filter(Boolean);
      const supported = getSupportedLanguages().map((l) => l.code);
      
      let newPath = '';
      if (segments[0] && supported.includes(segments[0] as any)) {
        segments[0] = lang;
        newPath = "/" + segments.join("/");
      } else {
        newPath = `/${lang}${currentPath === "/" ? "" : currentPath}`;
      }
      
      // Preserve query params and hash
      newPath += window.location.search + window.location.hash;
      
      if (newPath !== (currentPath + window.location.search + window.location.hash)) {
        window.location.href = newPath;
      }
    }
  }
}

export function getTranslation(
  key: string,
  overrideLang?: SupportedLanguage,
): string {
  const lang = overrideLang || getCurrentLanguage();
  const langTranslations = translations[lang];

  const keys = key.split(".");
  let result: any = langTranslations;

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }

  return typeof result === "string" ? result : key;
}

export function initI18n(): void {
  if (typeof document === "undefined") return;

  const lang = getCurrentLanguage();
  setLanguage(lang);

  // Initial translation of static elements
  translateAll();
}

export function translateAll(): void {
  if (typeof document === "undefined") return;

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const translation = getTranslation(key);

      // Look for data-i18n-attr to handle attributes
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        el.setAttribute(attr, translation);
      } else {
        el.textContent = translation;
      }
    }
  });
}
