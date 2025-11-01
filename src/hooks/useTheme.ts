import { create } from 'zustand';
import type { ThemeColors } from '../utils/types';
import { Themes, type ThemeName } from '../utils/themes';

interface ThemeState {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>((set, get) => {
  const storedTheme = (localStorage.getItem('theme') as ThemeName) || 'dark';

  if (storedTheme === 'dark') 
    document.documentElement.classList.add('dark');
  else
    document.documentElement.classList.remove('dark');

  return {
    theme: storedTheme,
    colors: Themes[storedTheme],

    setTheme: (theme) => {
      localStorage.setItem('theme', theme);

      // Update Tailwind dark class
      if (theme === 'dark')
        document.documentElement.classList.add('dark');
      else
        document.documentElement.classList.remove('dark');

      document.documentElement.setAttribute('data-theme', theme);
      set({ theme, colors: Themes[theme] });
    },

    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },
  };
});
