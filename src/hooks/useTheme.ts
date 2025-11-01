import { create } from 'zustand';
import type { ThemeColors } from '../utils/types';
import { Themes, type ThemeName } from '../utils/themes';

interface ThemeState {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('theme') as ThemeName) || 'dark',
  colors: Themes[(localStorage.getItem('theme') as ThemeName) || 'dark'],

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme, colors: Themes[theme] });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
