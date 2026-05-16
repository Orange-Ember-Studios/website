/**
 * View Transitions API integration for EmberKit SPA
 * 
 * Provides smooth visual transitions between route changes using the
 * native View Transitions API with graceful fallback for unsupported browsers.
 */

declare global {
  interface Document {
    startViewTransition?: (callback: () => void | Promise<void>) => {
      finished: Promise<void>;
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}

/**
 * Check if the browser supports the View Transitions API
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

/**
 * Wrap a navigation callback in a view transition if supported
 */
export function withViewTransition(
  callback: () => void | Promise<void>,
): Promise<void> {
  if (!supportsViewTransitions() || !document.startViewTransition) {
    // Fallback: just execute the callback
    return Promise.resolve(callback());
  }

  const transition = document.startViewTransition(() => {
    return Promise.resolve(callback());
  });

  return transition.finished.catch((error) => {
    // Transitions can be aborted by the user or browser
    if (error.name !== "AbortError") {
      console.warn("[view-transitions] Transition failed:", error);
    }
  });
}

/**
 * Check if a link should trigger a view transition
 */
function shouldTransition(anchor: HTMLAnchorElement): boolean {
  // Skip external links
  if (anchor.origin !== window.location.origin) {
    return false;
  }

  // Skip links with target="_blank"
  if (anchor.target === "_blank") {
    return false;
  }

  // Skip download links
  if (anchor.hasAttribute("download")) {
    return false;
  }

  // Skip links with data-no-transition attribute
  if (anchor.hasAttribute("data-no-transition")) {
    return false;
  }

  // Skip hash-only links on the same page
  const currentPathname = window.location.pathname;
  const targetPathname = new URL(anchor.href, window.location.href).pathname;
  if (
    currentPathname === targetPathname &&
    anchor.href.includes("#")
  ) {
    return false;
  }

  return true;
}

/**
 * Navigate via SPA pushState and return a Promise that resolves once
 * EmberKit's renderCurrentRoute has updated the #app container.
 *
 * This is the atomic unit used inside startViewTransition so the API
 * captures the correct *new* DOM state before animating.
 */
function spaNavigate(href: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const appRoot = document.getElementById("app");
    if (!appRoot) {
      history.pushState(null, "", href);
      resolve();
      return;
    }

    // Observe the first childList mutation on #app — that's EmberKit
    // calling target.innerHTML = html inside renderToTarget.
    const observer = new MutationObserver(() => {
      observer.disconnect();
      window.scrollTo({ top: 0, behavior: "instant" });
      resolve();
    });
    observer.observe(appRoot, { childList: true });

    // Trigger SPA navigation. EmberKit's patched history.pushState
    // calls renderCurrentRoute() which is async (module import) and
    // then sets target.innerHTML, firing the observer above.
    history.pushState(null, "", href);

    // Safety valve: resolve after 600 ms even if no mutation fires
    // (e.g. navigating to the same route).
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 600);
  });
}

/**
 * Initialize view transitions for navigation
 *
 * Intercepts clicks on internal links, wraps the SPA navigation in a
 * View Transition, and waits for EmberKit to finish rendering before
 * letting the API capture the new-state snapshot.
 */
export function initViewTransitions(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Don't initialize multiple times
  if ((window as any).__viewTransitionsInitialized) {
    return;
  }
  (window as any).__viewTransitionsInitialized = true;

  // Intercept link clicks
  document.addEventListener(
    "click",
    (event) => {
      // Find the anchor element (might be nested)
      const anchor = (event.target as Element).closest("a");
      if (!anchor) {
        return;
      }

      // Check if we should transition
      if (!shouldTransition(anchor)) {
        return;
      }

      // Check for modifier keys (Ctrl/Cmd+click, etc.)
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      // Prevent default browser navigation and stop propagation so
      // EmberKit's own click handler doesn't also push to history and
      // trigger a second renderCurrentRoute call.
      event.preventDefault();
      event.stopPropagation();

      // Wrap the *SPA* navigation (not a full-page reload) in a view
      // transition. The callback returns a Promise that resolves only
      // after EmberKit has written the new route HTML into #app, so
      // startViewTransition captures the correct new-state snapshot.
      void withViewTransition(() => spaNavigate(href));
    },
    { capture: true },
  );

  // Back/forward navigation: EmberKit's own popstate listener (registered
  // in render()) already calls renderCurrentRoute(). We don't register a
  // second popstate handler here because wrapping an async render inside
  // startViewTransition *after* EmberKit has already started it would race
  // and cause the same flash we're fixing. The CSS cross-fade defined in
  // global.css applies automatically to same-document navigations on
  // browsers that support view-transition-name without any JS.

  console.log(
    "[view-transitions] Initialized",
    supportsViewTransitions() ? "with API support" : "with fallback",
  );
}

/**
 * Programmatically navigate to a URL with a view transition.
 *
 * Uses SPA pushState/replaceState so styles are never reloaded.
 */
export function navigateWithTransition(
  href: string,
  options?: { replace?: boolean },
): Promise<void> {
  if (options?.replace) {
    return withViewTransition(
      () =>
        new Promise<void>((resolve) => {
          const appRoot = document.getElementById("app");
          if (!appRoot) {
            history.replaceState(null, "", href);
            resolve();
            return;
          }
          const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve();
          });
          observer.observe(appRoot, { childList: true });
          history.replaceState(null, "", href);
          setTimeout(() => {
            observer.disconnect();
            resolve();
          }, 600);
        }),
    );
  }
  return withViewTransition(() => spaNavigate(href));
}

/**
 * Create a wrapped navigate function that uses view transitions.
 *
 * This wraps EmberKit's navigate function to add view transitions.
 * Import this in components that need programmatic navigation with transitions.
 *
 * @example
 * ```tsx
 * import { navigate } from "@emberkit/core";
 * import { wrapNavigate } from "../lib/view-transitions";
 *
 * const nav = wrapNavigate(navigate);
 * nav("/en/blog");
 * ```
 */
export function wrapNavigate(
  originalNavigate: (path: string, options?: any) => void,
): (path: string, options?: any) => void {
  return (path: string, options?: any) => {
    if (!supportsViewTransitions()) {
      originalNavigate(path, options);
      return;
    }

    void withViewTransition(() => spaNavigate(path));
  };
}
