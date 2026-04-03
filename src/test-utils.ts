import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import vueRenderer from '@astrojs/vue/server.js';

export async function createAstroContainer() {
  const container = await AstroContainer.create();
  container.addServerRenderer({
    renderer: vueRenderer,
    name: '@astrojs/vue'
  });
  return container;
}

export function setupDOMEnvironment() {
  const window = new Window();
  const document = window.document;
  
  // Polyfill globals for @testing-library/dom
  Object.defineProperty(global, 'window', { value: window, writable: true });
  Object.defineProperty(global, 'document', { value: document, writable: true });
  Object.defineProperty(global, 'localStorage', { 
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    }, 
    writable: true 
  });
  Object.defineProperty(global, 'Node', { value: window.Node, writable: true });
  Object.defineProperty(global, 'Element', { value: window.Element, writable: true });
  Object.defineProperty(global, 'HTMLElement', { value: window.HTMLElement, writable: true });
  Object.defineProperty(global, 'DocumentFragment', { value: window.DocumentFragment, writable: true });
  
  return { window, document };
}
