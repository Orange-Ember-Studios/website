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

  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
  const supported = getSupportedLanguages().map((l) => l.code);

  if (stored && supported.includes(stored)) {
    return stored;
  }

  return "en";
}

export function setLanguage(lang: SupportedLanguage): void {
  localStorage.setItem(STORAGE_KEY, lang);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
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
