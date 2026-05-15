import { createEffect, createSignal } from "@emberkit/core";
import {
  getCurrentLanguage,
  getSupportedLanguages,
  setLanguage,
} from "../../i18n/i18n";
import type { SupportedLanguage } from "../../i18n/i18n";
import PremiumSelect from "../ui/PremiumSelect";

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
    supportedLanguages.find((l) => l.code === selectedLang())?.label || "English";

  // Wait for the select to be initialized and attach listener
  createEffect(() => {
    let retries = 0;
    const maxRetries = 50; // 5 seconds with 100ms intervals

    const attachListener = () => {
      const el = document.getElementById(id);
      if (!el) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(attachListener, 100);
        }
        return;
      }

      const handler = (e: Event) => {
        const ce = e as CustomEvent<{ values?: string[]; id?: string }>;
        const selectedId = ce.detail?.id;
        
        // Only handle events from this selector
        if (selectedId && selectedId !== "lang-selector") {
          return;
        }

        const newLang = ce.detail?.values?.[0] as SupportedLanguage | undefined;
        if (newLang && newLang !== selectedLang()) {
          setSelectedLang(newLang);
          setLanguage(newLang, true);
        }
      };

      el.addEventListener("change", handler);
      
      return () => el.removeEventListener("change", handler);
    };

    return attachListener();
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
