import { FileCode2, Boxes, Gauge, Layers, GitBranch, Calendar } from "lucide-react";
import type { NodeMetrics, ProjectMetrics } from "../../utils/types";

export interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  title?: string;
  subtitle?: string;
  details?: NodeMetrics | ProjectMetrics;
}

export const Tooltip = ({ visible, x, y, title, subtitle, details }: TooltipProps) => {
  if (!visible) return null;

  const isMetricsObject =
    details && typeof details === "object" && !Array.isArray(details);

  const metrics = isMetricsObject ? (details as NodeMetrics | ProjectMetrics) : null;

  const labelMap: Record<string, string> = {
    loc: "Lines of Code",
    complexity: "Complexity",
    imports: "Imports",
    classes: "Classes",
    functions: "Functions",
    methods: "Methods",
    calls: "Calls",
    lastModified: "Last Modified",
    totalFiles: "Total Files",
    totalLOC: "Total LOC",
    averageComplexity: "Avg. Complexity",
    averageDepth: "Avg. Depth",
    dependencies: "Dependencies",
  };

  const iconMap: Record<string, React.ReactNode> = {
    loc: <FileCode2 size={12} />,
    totalLOC: <FileCode2 size={12} />,
    complexity: <Gauge size={12} />,
    averageComplexity: <Gauge size={12} />,
    imports: <GitBranch size={12} />,
    dependencies: <GitBranch size={12} />,
    classes: <Boxes size={12} />,
    functions: <Layers size={12} />,
    methods: <Layers size={12} />,
    calls: <GitBranch size={12} />,
    totalFiles: <Boxes size={12} />,
    averageDepth: <Gauge size={12} />,
    lastModified: <Calendar size={12} />,
  };

  return (
    <div
      className="fixed z-50 pointer-events-none max-w-xs transition-all duration-150"
      style={{
        left: x + 15,
        top: y + 15,
      }}
    >
      <div
        className="
          bg-white/90 border border-gray-300 rounded-xl shadow-2xl
          dark:bg-[#0b0f19]/90 dark:border-white/10
          px-4 py-3 backdrop-blur-md
          text-gray-900 dark:text-gray-200 font-sans
        "
      >
        {/* Title */}
        {title && (
          <div className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-0.5">
            {title}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <div className="text-gray-500 dark:text-gray-400 text-xs mb-2">{subtitle}</div>
        )}

        {/* Metrics block */}
        {metrics ? (
          <div className="space-y-1">
            {Object.entries(metrics).map(([key, value]) => {
              const label = labelMap[key] || key;
              const icon = iconMap[key] || null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    {icon}
                    <span>{label}</span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">
                    {typeof value === "number"
                      ? value.toFixed(2).replace(/\.00$/, "")
                      : value}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          details && (
            <pre className="text-gray-700 dark:text-gray-300 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          )
        )}
      </div>
    </div>
  );
};
