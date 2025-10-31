export interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  title?: string;
  subtitle?: string;
  details?: string;
}

export const Tooltip = ({ visible, x, y, title, subtitle, details }: TooltipProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none max-w-xs"
      style={{
        left: x + 15,
        top: y + 15,
      }}
    >
      <div
        className="bg-gray-900 bg-opacity-95 border border-gray-700 rounded-lg shadow-xl p-4"
        style={{ backdropFilter: 'blur(6px)' }}
      >
        {title && <div className="font-bold text-blue-400 text-base mb-1">{title}</div>}
        {subtitle && <div className="text-gray-400 text-sm mb-2">{subtitle}</div>}
        {details && (
          <pre className="text-gray-200 text-xs font-mono max-h-40 overflow-auto whitespace-pre-wrap">
            {details}
          </pre>
        )}
      </div>
    </div>
  );
};
