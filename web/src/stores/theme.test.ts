import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './theme';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({ theme: 'system', effectiveTheme: 'light' });
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('dark');
  });

  // TC-009: setTheme('light') applies light theme
  it('setTheme light applies light mode', () => {
    useThemeStore.getState().setTheme('light');

    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().effectiveTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  // TC-010: setTheme('dark') applies dark theme
  it('setTheme dark applies dark mode', () => {
    useThemeStore.getState().setTheme('dark');

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().effectiveTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  // TC-011: setTheme('system') resolves based on matchMedia
  it('setTheme system resolves based on prefers-color-scheme', () => {
    // jsdom matchMedia defaults to not matching dark mode
    useThemeStore.getState().setTheme('system');

    expect(useThemeStore.getState().theme).toBe('system');
    expect(localStorage.getItem('theme')).toBe('system');
  });

  // TC-012: Theme preference persists to localStorage
  it('persists theme preference to localStorage', () => {
    useThemeStore.getState().setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    useThemeStore.getState().setTheme('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  // TC-013: initTheme restores persisted preference
  it('initTheme restores persisted preference', () => {
    localStorage.setItem('theme', 'dark');

    useThemeStore.getState().initTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().effectiveTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  // TC-014: initTheme defaults to 'system' when no stored value
  it('initTheme defaults to system when no stored value', () => {
    useThemeStore.getState().initTheme();

    expect(useThemeStore.getState().theme).toBe('system');
  });

  // TC-015: initTheme ignores invalid stored values
  it('initTheme ignores invalid stored values', () => {
    localStorage.setItem('theme', 'invalid-value');

    useThemeStore.getState().initTheme();

    expect(useThemeStore.getState().theme).toBe('system');
  });
});
