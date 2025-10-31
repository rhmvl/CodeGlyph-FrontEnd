import type { GraphNode } from '../../utils/types';

interface SidebarProps {
  node: GraphNode | null;
  onClose: () => void;
}

export const Sidebar = ({ node, onClose }: SidebarProps) => {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-gray-900 text-gray-100 border-l border-gray-700 transform transition-transform duration-300 ${
        node ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">{node?.name || 'Details'}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      {node ? (
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Type */}
          <div>
            <span className="text-gray-400 font-semibold text-sm">Type:</span>
            <span className="ml-2 text-gray-100">{node.type}</span>
          </div>

          {/* Metrics */}
          {node.metrics && Object.keys(node.metrics).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 space-y-2 shadow-inner">
              <h3 className="text-gray-400 font-semibold text-sm mb-2">Metrics</h3>
              <div className="space-y-1">
                {Object.entries(node.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{key}</span>
                    <span className="text-gray-100 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotion */}
          {node.emotion && Object.keys(node.emotion).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 space-y-2 shadow-inner">
              <h3 className="text-gray-400 font-semibold text-sm mb-2">Emotion</h3>
              <div className="space-y-1">
                {Object.entries(node.emotion).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{key}</span>
                    <span className="text-gray-100 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-gray-500 text-sm">Select a node to see details.</div>
      )}
    </div>
  );
};
