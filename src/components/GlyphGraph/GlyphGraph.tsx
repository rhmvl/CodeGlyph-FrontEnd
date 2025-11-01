import { useEffect, useRef, useState } from 'react';
import type { CodeGlyphData, GraphNode } from '../../utils/types';
import { GraphRenderer } from './Renderer/GraphRenderer';
import { Tooltip, type TooltipProps } from './Tooltip';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../hooks/useTheme';
import { getGradientMood } from '../../utils/getGradientMood';
// import { MiniMap } from './MiniMap';

const defaultMotion = {
  pulseSpeed: 1, glowIntensity: 4, sizeScale: 0.5
}

const GlyphGraph = ({ data, width = 1200, height = 800 }: { data: CodeGlyphData; width?: number; height?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GraphRenderer | null>(null);
  const { colors: baseColors, theme, toggleTheme } = useTheme();
  const [tooltip, setTooltip] = useState<TooltipProps>({ visible: false, x: 0, y: 0, title: '', subtitle: '', details: '' });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new GraphRenderer(canvasRef.current, data, width, height, baseColors, defaultMotion);
    }

    const renderer = rendererRef.current;
    let dragStartX = 0;
    let dragStartY = 0;
    const DRAG_THRESHOLD = 5; // pixels
    let hoverRAF: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (hoverRAF) cancelAnimationFrame(hoverRAF);

      hoverRAF = requestAnimationFrame(() => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const camera = renderer.cameraState;
        const graphX = (mouseX - camera.offsetX) / camera.scale;
        const graphY = (mouseY - camera.offsetY) / camera.scale;

        // update nodes and links hover states
        renderer.nodes.forEach(n => n.setHover(n.isPointInside(graphX, graphY)));
        renderer.links.forEach(l => l.setHover(l.isPointInside(graphX, graphY)));
        // tooltip
        const node = renderer.getNodeAt(mouseX, mouseY);
        if (node) {
          const screenX = node.x * renderer.scale + renderer.offsetX;
          const screenY = node.y * renderer.scale + renderer.offsetY;
          setTooltip({
            visible: true,
            x: screenX + rect.left,
            y: screenY + rect.top,
            title: node.data.name,
            subtitle: node.data.type,
            details: JSON.stringify(node.data.metrics || {}, null, 2),
          });
        } else {
          setTooltip(t => ({ ...t, visible: false }));
        }
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const handleMouseUp = (e: MouseEvent) => {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= DRAG_THRESHOLD) return;

      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = renderer.getNodeAt(x, y);
      if (node) setSelectedNode(node.data);
    };

    // Attach mouse events
    canvasRef.current.addEventListener('pointerdown', handleMouseDown);
    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
      canvasRef.current?.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.updateTheme(baseColors);
  }, [baseColors]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br transition-all duration-700 bg-mood-animate`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <Tooltip {...tooltip} />
      <Sidebar node={selectedNode} onClose={() => setSelectedNode(null)} />

      <button
        onClick={toggleTheme}
        className="absolute top-2 right-2 text-sm px-3 py-1 rounded bg-gray-800/60 text-white backdrop-blur-md hover:bg-gray-700 transition"
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="absolute bottom-2 left-2 text-xs text-white/80">
        Mood: {data.project.metrics.averageComplexity.toFixed(2)} complexity
      </div>
    </div>
  );
};

export default GlyphGraph;
