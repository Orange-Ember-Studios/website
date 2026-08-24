/// <reference types="astro/client" />

import type { SupportedLanguage } from "./src/i18n/i18n";

declare global {
  namespace App {
    interface Locals {
      lang: SupportedLanguage;
      user?: { userId: string; username: string };
    }
  }
}
