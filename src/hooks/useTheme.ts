import { create } from "zustand";
import type { ThemeColors } from "../utils/types";
import { Themes, type ThemeName } from "../utils/themes";

interface ThemeState {
  theme: ThemeName;
  colors: ThemeColors;
  initialized: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark",
  colors: Themes.dark,
  initialized: false,

  initTheme: () => {
    if (typeof window === "undefined") return;

    const storedTheme = (localStorage.getItem("theme") as ThemeName) || "dark";

    document.documentElement.classList.toggle("dark", storedTheme === "dark");
    document.documentElement.setAttribute("data-theme", storedTheme);

    set({
      theme: storedTheme,
      colors: Themes[storedTheme],
      initialized: true,
    });
  },

  /** Manually set a theme */
  setTheme: (theme) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);

    set({ theme, colors: Themes[theme] });
  },

  /** Toggle between light/dark */
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
