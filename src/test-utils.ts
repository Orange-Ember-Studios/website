import { Window } from "happy-dom";

/** @deprecated Legacy Astro tests removed; use Vue/EmberKit tests instead. */
export async function createAstroContainer(): Promise<never> {
  throw new Error("createAstroContainer was removed with Astro; mount Vue/TSX components directly.");
}

export function setupDOMEnvironment() {
  const window = new Window();
  const document = window.document;

  Object.defineProperty(global, "window", { value: window, writable: true });
  Object.defineProperty(global, "document", { value: document, writable: true });
  Object.defineProperty(global, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
    writable: true,
  });
  Object.defineProperty(global, "Node", { value: window.Node, writable: true });
  Object.defineProperty(global, "Element", { value: window.Element, writable: true });
  Object.defineProperty(global, "HTMLElement", { value: window.HTMLElement, writable: true });
  Object.defineProperty(global, "DocumentFragment", { value: window.DocumentFragment, writable: true });

  return { window, document };
}
