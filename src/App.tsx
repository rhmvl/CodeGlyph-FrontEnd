import { useTheme } from "./hooks/useTheme";
import GlyphGraph from "./components/GlyphGraph/GlyphGraph";
import { loadCodeGlyphData } from "./utils/api";
import { ControlPanel } from "./components/ControlPanel";
import { useEffect } from "react";

function App() {
  const { theme, toggleTheme, initTheme } = useTheme();
  const data = loadCodeGlyphData();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div
      className={`
        w-screen h-screen relative overflow-hidden
        font-['JetBrains_Mono',_monospace]
        transition-colors duration-700
        bg-gradient-to-b from-[#f9fafb] via-[#f3f4f6] to-[#e5e7eb] text-gray-800
        dark:from-[#090d17] dark:via-[#0a0e18] dark:to-[#05070c] dark:text-gray-200
      `}
    >
      {/* Ambient layers */}
      <div className="absolute inset-0 pointer-events-none bg-noise-pattern mix-blend-soft-light opacity-[0.06] dark:opacity-10" />
      <div className="absolute inset-0 pointer-events-none bg-radial-dark dark:bg-radial-light" />

      {/* Control Panel */}
      <ControlPanel theme={theme} toggleTheme={toggleTheme} />

      {/* Graph Canvas */}
      <GlyphGraph data={data} width={window.innerWidth} height={window.innerHeight} />

      {/* HUD */}
      <div
        className="
          absolute bottom-4 left-4 text-[11px] px-2 py-1 rounded-md
          backdrop-blur-md border font-mono select-none
          text-gray-600 bg-black/5 border-black/10
          dark:text-gray-400 dark:bg-black/30 dark:border-white/10
        "
      >
        Avg. Complexity: {data.project.metrics.averageComplexity.toFixed(2)}
      </div>

      {/* Ambient accent line */}
      <div
        className="
          absolute top-0 left-0 w-full h-px
          bg-gradient-to-r from-transparent via-blue-400/40 to-transparent
          dark:via-cyan-400/30
        "
      />
    </div>
  );
}

export default App;
