import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  supportsViewTransitions,
  withViewTransition,
  initViewTransitions,
} from "@emberkit/core";

describe("view-transitions", () => {
  let originalStartViewTransition: typeof document.startViewTransition | undefined;

  beforeEach(() => {
    originalStartViewTransition = document.startViewTransition;
  });

  afterEach(() => {
    if (originalStartViewTransition === undefined) {
      delete (document as Document & { startViewTransition?: typeof document.startViewTransition })
        .startViewTransition;
    } else {
      document.startViewTransition = originalStartViewTransition;
    }
  });

  describe("supportsViewTransitions", () => {
    it("returns true when API is available", () => {
      document.startViewTransition = () =>
        ({
          finished: Promise.resolve(),
          ready: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          skipTransition: () => {},
        }) as ViewTransition;
      expect(supportsViewTransitions()).toBe(true);
    });

    it("returns false when API is not available", () => {
      delete (document as Document & { startViewTransition?: typeof document.startViewTransition })
        .startViewTransition;
      expect(supportsViewTransitions()).toBe(false);
    });
  });

  describe("withViewTransition", () => {
    it("uses view transition API when available", async () => {
      const mockStartViewTransition = vi.fn((cb: () => void | Promise<void>) => {
        void Promise.resolve(cb());
        return {
          finished: Promise.resolve(),
          ready: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          skipTransition: () => {},
        };
      });
      document.startViewTransition = mockStartViewTransition;

      const callback = vi.fn();
      await withViewTransition(callback);

      expect(mockStartViewTransition).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it("falls back when API is not available", async () => {
      delete (document as Document & { startViewTransition?: typeof document.startViewTransition })
        .startViewTransition;

      const callback = vi.fn();
      await withViewTransition(callback);

      expect(callback).toHaveBeenCalled();
    });

    it("ignores AbortError on transition failure", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      document.startViewTransition = () => ({
        finished: Promise.reject(new DOMException("Aborted", "AbortError")),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: () => {},
      });

      await withViewTransition(() => undefined);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("initViewTransitions", () => {
    it("can be called multiple times without throwing", () => {
      expect(() => {
        initViewTransitions();
        initViewTransitions();
      }).not.toThrow();
    });

    it("skips external links", () => {
      initViewTransitions();

      const anchor = document.createElement("a");
      anchor.href = "https://external.com";
      document.body.appendChild(anchor);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it("skips links with target=_blank", () => {
      initViewTransitions();

      const anchor = document.createElement("a");
      anchor.href = "/test";
      anchor.target = "_blank";
      document.body.appendChild(anchor);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it("skips download links", () => {
      initViewTransitions();

      const anchor = document.createElement("a");
      anchor.href = "/file.pdf";
      anchor.setAttribute("download", "");
      document.body.appendChild(anchor);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it("skips hash-only links on same page", () => {
      initViewTransitions();

      const anchor = document.createElement("a");
      anchor.href = `${window.location.pathname}#section`;
      document.body.appendChild(anchor);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });

    it("skips links with data-no-transition attribute", () => {
      initViewTransitions();

      const anchor = document.createElement("a");
      anchor.href = "/test";
      anchor.setAttribute("data-no-transition", "");
      document.body.appendChild(anchor);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      anchor.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      document.body.removeChild(anchor);
    });
  });
});
