import { Sun, Moon, LayoutGrid, Zap } from "lucide-react";

interface ControlPanelProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  onToggleLayout?: () => void;
  onBoostMode?: () => void;
}

export const ControlPanel = ({
  theme,
  toggleTheme,
  onToggleLayout,
  onBoostMode,
}: ControlPanelProps) => {
  return (
    <div
      className="
        fixed top-0 left-0 w-full h-10 z-50
        flex items-center justify-end gap-2
        px-4 backdrop-blur-md
        border-b transition-colors duration-500
        bg-white/60 border-black/10 text-gray-700
        dark:bg-black/30 dark:border-white/10 dark:text-gray-300
      "
    >
      <div className="flex items-center gap-2">
        {/* Layout toggle */}
        {onToggleLayout && (
          <button
            onClick={onToggleLayout}
            className="
              p-1.5 rounded-md
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors duration-200
            "
            title="Toggle layout view"
          >
            <LayoutGrid size={16} />
          </button>
        )}

        {/* Performance/Boost toggle */}
        {onBoostMode && (
          <button
            onClick={onBoostMode}
            className="
              p-1.5 rounded-md
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors duration-200
            "
            title="Toggle boost mode"
          >
            <Zap size={16} />
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-1.5 rounded-md
            hover:bg-black/10 dark:hover:bg-white/10
            transition-colors duration-200
          "
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};
