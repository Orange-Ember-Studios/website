import { createEffect, createSignal } from "@emberkit/core";
import {
  getCurrentLanguage,
  getSupportedLanguages,
  setLanguage,
} from "../../i18n/i18n.ts";
import type { SupportedLanguage } from "../../i18n/i18n.ts";
import PremiumSelect from "../ui/PremiumSelect.tsx";

export function PremiumLanguageSelector({
  lang: propLang,
  id = "nav-lang-selector",
}: {
  lang?: SupportedLanguage;
  id?: string;
}) {
  const supportedLanguages = getSupportedLanguages();
  const currentLang = propLang || getCurrentLanguage();
  const [selectedLang, setSelectedLang] = createSignal(currentLang);

  const langOptions = supportedLanguages.map((lang) => ({
    id: lang.code,
    label: lang.label,
    color:
      lang.code === "en"
        ? "bg-blue-500"
        : lang.code === "es"
          ? "bg-red-500"
          : "bg-white/20",
  }));

  const currentLangLabel =
    supportedLanguages.find((l) => l.code === selectedLang())?.label ||
    "English";

  /** Bubble-phase listener on document — survives timing vs initPremiumSelects(). */
  createEffect(() => {
    const handler = (e: Event) => {
      if (!(e instanceof CustomEvent)) return;
      const ce = e as CustomEvent<{
        values?: string[];
        id?: string;
      }>;
      if (ce.detail?.id !== "lang-selector") return;

      const container = document.getElementById(id);
      if (!container || e.target !== container) return;

      const raw = ce.detail.values?.[0];
      const newLang = raw as SupportedLanguage | undefined;
      const codes = supportedLanguages.map((l) => l.code);
      if (!newLang || !codes.includes(newLang)) return;
      if (newLang === selectedLang()) return;

      setSelectedLang(newLang);
      setLanguage(newLang, true);
    };

    document.addEventListener("change", handler);
    return () => document.removeEventListener("change", handler);
  });

  return (
    <div className="premium-lang-selector-wrapper">
      <PremiumSelect
        id="lang-selector"
        options={langOptions}
        isMultiple={false}
        initialValues={[selectedLang()]}
        defaultLabel={currentLangLabel}
        variant="navbar"
        containerId={id}
      />
    </div>
  );
}

export default PremiumLanguageSelector;
