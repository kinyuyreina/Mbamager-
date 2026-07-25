import { create } from 'zustand';
import { storage } from '../utils/format';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: storage.get<ThemeMode>('mb_theme', 'light'), // Default to sleek Light Mode with gold accents for Mbamager F11

  toggleTheme: () => {
    const current = get().theme;
    const nextTheme = current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
    get().setTheme(nextTheme);
  },

  setTheme: (theme: ThemeMode) => {
    storage.set('mb_theme', theme);
    set({ theme });
    get().applyTheme();
  },

  applyTheme: () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const currentTheme = get().theme;
    
    let resolvedTheme: 'light' | 'dark' = 'dark';
    if (currentTheme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = currentTheme === 'light' ? 'light' : 'dark';
    }
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  },
}));
