import { describe, it, expect, vi, beforeEach } from "vitest";
import { initPremiumSelects } from "./premium-select-init.ts";

describe("initPremiumSelects", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("dispatches a bubbling CustomEvent so document-level listeners receive it", () => {
    document.body.innerHTML = `
      <div
        id="desktop-lang-selector"
        class="premium-select-container"
        data-is-multiple="false"
        data-id="lang-selector"
        data-initial-values='["en"]'
      >
        <div class="relative w-full">
          <button type="button" class="select-trigger">
            <span class="selected-label">English 🇺🇸</span>
            <span class="arrow-icon"></span>
          </button>
          <div class="select-dropdown flex-col hidden absolute">
            <button type="button" class="option-btn" data-value="es">
              <span>Español 🇪🇸</span>
            </button>
          </div>
        </div>
      </div>`;

    const docSpy = vi.fn();
    document.addEventListener("change", docSpy);

    initPremiumSelects();

    const esBtn = document.querySelector(
      '[data-value="es"]',
    ) as HTMLButtonElement;
    esBtn.click();

    expect(docSpy).toHaveBeenCalledTimes(1);
    const ev = docSpy.mock.calls[0][0];
    expect(ev).toBeInstanceOf(CustomEvent);
    const ce = ev as CustomEvent<{ id?: string; values?: string[] }>;
    expect(ce.detail?.id).toBe("lang-selector");
    expect(ce.detail?.values).toEqual(["es"]);
    expect(ce.bubbles).toBe(true);

    document.removeEventListener("change", docSpy);
  });

  it("updates the trigger label for single-select after choosing an option", () => {
    document.body.innerHTML = `
      <div
        class="premium-select-container"
        data-is-multiple="false"
        data-id="lang-selector"
        data-initial-values='["en"]'
      >
        <div class="relative w-full">
          <button type="button" class="select-trigger">
            <span class="selected-label">English 🇺🇸</span>
          </button>
          <div class="select-dropdown flex-col hidden absolute">
            <button type="button" class="option-btn" data-value="fr">
              <span>Français 🇫🇷</span>
            </button>
          </div>
        </div>
      </div>`;

    initPremiumSelects();

    (
      document.querySelector('[data-value="fr"]') as HTMLButtonElement
    ).click();

    expect(document.querySelector(".selected-label")?.textContent?.trim()).toBe(
      "Français 🇫🇷",
    );
  });
});
