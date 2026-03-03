import '@testing-library/jest-dom/vitest';

// Mock localStorage for jsdom environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string): string | null => store[key] ?? null,
  setItem: (key: string, value: string): void => { store[key] = String(value); },
  removeItem: (key: string): void => { delete store[key]; },
  clear: (): void => { Object.keys(store).forEach(key => delete store[key]); },
  get length(): number { return Object.keys(store).length; },
  key: (index: number): string | null => Object.keys(store)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Mock matchMedia for jsdom environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
