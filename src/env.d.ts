import type { SupportedLanguage } from "./i18n/i18n";

declare global {
  namespace App {
    interface Locals {
      lang: SupportedLanguage;
    }
  }
}
