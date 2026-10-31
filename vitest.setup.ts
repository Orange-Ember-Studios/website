import '@testing-library/jest-dom/vitest';

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    get length(): number {
      return store.size;
    },
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createStorageMock();
}

if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = createStorageMock();
}
