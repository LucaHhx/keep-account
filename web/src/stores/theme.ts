import { create } from 'zustand';
import { getCurrentWindow } from '@tauri-apps/api/window';

type ThemeMode = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

function getSystemTheme(): EffectiveTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(effective: EffectiveTheme) {
  document.documentElement.classList.toggle('dark', effective === 'dark');
  try {
    getCurrentWindow().setTheme(effective).catch(() => {});
  } catch {
    // Not in Tauri environment
  }
}

function resolveEffective(theme: ThemeMode): EffectiveTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

const STORAGE_KEY = 'theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  effectiveTheme: 'light',

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    const effectiveTheme = resolveEffective(theme);
    applyTheme(effectiveTheme);
    set({ theme, effectiveTheme });
  },

  initTheme: () => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const theme = stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
    const effectiveTheme = resolveEffective(theme);
    applyTheme(effectiveTheme);
    set({ theme, effectiveTheme });

    // Listen for system theme changes
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      const current = get().theme;
      if (current === 'system') {
        const effective = getSystemTheme();
        applyTheme(effective);
        set({ effectiveTheme: effective });
      }
    });
  },
}));
