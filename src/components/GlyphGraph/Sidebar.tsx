import { X, Gauge, Heart, Bug } from "lucide-react";
import type { GraphNode } from "../../utils/types";
import { useEffect, useState } from "react";

interface SidebarProps {
  node: GraphNode | null;
  onClose: () => void;
}


function AnimatedBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const id = requestAnimationFrame(() => {
      setWidth(Math.min(value * 10, 100));
    });
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="w-full h-1.5 bg-gray-300/40 dark:bg-white/5 rounded-full overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export const Sidebar = ({ node, onClose }: SidebarProps) => {
  return (
    <div
      className={`
        fixed right-0 top-0 h-full w-96 z-50
        transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        backdrop-blur-xl border-l shadow-[0_0_25px_rgba(0,0,0,0.2)]
        translate-x-full
        ${node ? "!translate-x-0" : ""}
        bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 text-gray-800 border-black/10
        dark:from-[#0e111a] dark:via-[#121622] dark:to-[#0b0e16] dark:text-gray-100 dark:border-white/10 dark:shadow-[0_0_25px_rgba(0,0,0,0.4)]
      `}
    >
      {/* Header */}
      <div className="
        sticky top-0 flex items-center justify-between p-4 border-b backdrop-blur-md
        bg-white/60 border-black/10
        dark:bg-black/20 dark:border-white/10
      ">
        <h2 className="text-lg font-semibold tracking-wide">
          {node?.name || "Details"}
        </h2>
        <button
          onClick={onClose}
          className="
            text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100
            transition-colors duration-200 p-1 rounded-md
            hover:bg-black/5 dark:hover:bg-white/5
            relative z-50
          "
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      {node ? (
        <div className="p-5 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          {/* Basic Info */}
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Type</div>
            <div className="text-base text-gray-800 dark:text-gray-100">{node.type}</div>
          </div>

          {/* Metrics Section */}
          {node.metrics && Object.keys(node.metrics).length > 0 && (
            <div className="
              rounded-xl p-4 border shadow-inner space-y-3
              bg-gray-100/60 border-black/10
              dark:bg-white/5 dark:border-white/10
            ">
              <div className="flex items-center gap-2 mb-2">
                <Gauge size={16} className="text-cyan-500 dark:text-cyan-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Metrics
                </h3>
              </div>

              {Object.entries(node.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      {key}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {typeof value === "number"
                        ? value
                        : String(value)}
                    </span>
                  </div>

                  {/* Bar visualization */}
                  {typeof value === "number" && (
                    <AnimatedBar value={value}
                      color={
                        key.toLowerCase() === "bugscore"
                          ? "bg-amber-500/70 dark:bg-amber-400/70"
                          : "bg-cyan-500/60 dark:bg-cyan-400/60"
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Emotion Section */}
          {node.emotion && Object.keys(node.emotion).length > 0 && (
            <div className="
              rounded-xl p-4 border shadow-inner space-y-3
              bg-gray-100/60 border-black/10
              dark:bg-white/5 dark:border-white/10
            ">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-pink-500 dark:text-pink-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Emotion
                </h3>
              </div>
              {Object.entries(node.emotion).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>{key}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {value}
                    </span>
                  </div>
                  <AnimatedBar value={value} color={`${
                        key === "tension"
                          ? "bg-red-400/60"
                          : key === "stability"
                          ? "bg-green-400/60"
                          : "bg-blue-400/60"
                      }`}
                    />
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      text-xs font-medium px-2 py-1 rounded-md border
                      bg-cyan-200/30 text-cyan-700 border-cyan-500/30
                      dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-400/20
                    "
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 text-gray-500 dark:text-gray-400 text-sm">
          Select a node to see details.
        </div>
      )}
    </div>
  );
};
