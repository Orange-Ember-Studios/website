import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  supportsViewTransitions,
  withViewTransition,
  initViewTransitions,
} from "./view-transitions";

describe("view-transitions", () => {
  let originalStartViewTransition: any;

  beforeEach(() => {
    // Save original
    originalStartViewTransition = (document as any).startViewTransition;
  });

  afterEach(() => {
    // Restore original
    if (originalStartViewTransition === undefined) {
      delete (document as any).startViewTransition;
    } else {
      (document as any).startViewTransition = originalStartViewTransition;
    }

    // Clean up initialization flag
    delete (window as any).__viewTransitionsInitialized;
  });

  describe("supportsViewTransitions", () => {
    it("returns true when API is available", () => {
      (document as any).startViewTransition = () => {};
      expect(supportsViewTransitions()).toBe(true);
    });

    it("returns false when API is not available", () => {
      delete (document as any).startViewTransition;
      expect(supportsViewTransitions()).toBe(false);
    });
  });

  describe("withViewTransition", () => {
    it("uses view transition API when available", async () => {
      const mockFinished = Promise.resolve();
      const mockReady = Promise.resolve();
      const mockUpdateCallbackDone = Promise.resolve();

      let capturedCallback: any = null;
      const mockStartViewTransition = vi.fn((cb: any) => {
        capturedCallback = cb;
        // Execute the callback immediately
        const result = cb();
        return {
          finished: Promise.resolve(result).then(() => mockFinished),
          ready: mockReady,
          updateCallbackDone: mockUpdateCallbackDone,
        };
      });

      (document as any).startViewTransition = mockStartViewTransition;

      const callback = vi.fn(() => Promise.resolve());
      await withViewTransition(callback);

      expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("falls back to direct execution when API is not available", async () => {
      delete (document as any).startViewTransition;

      const callback = vi.fn(() => Promise.resolve());
      await withViewTransition(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("handles transition errors gracefully", async () => {
      const testError = new Error("Test error");
      const mockFinished = Promise.reject(testError);
      const mockReady = Promise.resolve();
      const mockUpdateCallbackDone = Promise.resolve();

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      (document as any).startViewTransition = vi.fn((cb: any) => {
        cb();
        return {
          finished: mockFinished,
          ready: mockReady,
          updateCallbackDone: mockUpdateCallbackDone,
        };
      });

      const callback = vi.fn(() => Promise.resolve());
      await withViewTransition(callback);

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("ignores AbortError silently", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      const mockFinished = Promise.reject(abortError);
      const mockReady = Promise.resolve();
      const mockUpdateCallbackDone = Promise.resolve();

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      (document as any).startViewTransition = vi.fn((cb: any) => {
        cb();
        return {
          finished: mockFinished,
          ready: mockReady,
          updateCallbackDone: mockUpdateCallbackDone,
        };
      });

      const callback = vi.fn(() => Promise.resolve());
      await withViewTransition(callback);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("initViewTransitions", () => {
    it("initializes only once", () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      initViewTransitions();
      initViewTransitions();
      initViewTransitions();

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      consoleLogSpy.mockRestore();
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
