import { create } from "zustand";

export type Theme = "Calm" | "Mechanical" | "Neural";

interface ThemeState {
  currentTheme: Theme;
  colors: Record<string, string>;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: "Calm",
  colors: {
    node: "#6EE7B7",
    edge: "#3B82F6",
    background: "#111827",
    aura: "#22D3EE",
  },
  setTheme: (theme: Theme) => {
    let colors;
    switch (theme) {
      case "Mechanical":
        colors = { node: "#FACC15", edge: "#F87171", background: "#1F2937", aura: "#F472B6" };
        break;
      case "Neural":
        colors = { node: "#C084FC", edge: "#F472B6", background: "#111827", aura: "#93C5FD" };
        break;
      default:
        colors = { node: "#6EE7B7", edge: "#3B82F6", background: "#111827", aura: "#22D3EE" };
    }
    set({ currentTheme: theme, colors });
  },
}));
