import { useEffect, useRef, useState } from 'react';
import type { CodeGlyphData, GraphNode } from '../../utils/types';
import { GraphRenderer } from './Renderer/GraphRenderer';
import { Tooltip, type TooltipProps } from './Tooltip';
import { Sidebar } from './Sidebar';
import { MiniMap } from './MiniMap';

const GlyphGraph = ({ data, width = 1200, height = 800 }: { data: CodeGlyphData; width?: number; height?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipProps>({ visible: false, x: 0, y: 0, title: '', subtitle: '', details: '' });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new GraphRenderer(canvasRef.current, data, width, height);

    let dragStartX = 0;
    let dragStartY = 0;
    const DRAG_THRESHOLD = 5; // pixels

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

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
    window.addEventListener('pointermove', handleMouseMove); // window instead of canvas
    window.addEventListener('pointerup', handleMouseUp);      // window instead of canvas

    return () => {
      renderer.destroy();
      canvasRef.current?.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [data, width, height]);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      <canvas ref={canvasRef} width={width} height={height}/>
      <Tooltip {...tooltip} />
      <Sidebar node={selectedNode} onClose={() => setSelectedNode(null)} />
      { /* <MiniMap /> */ }
    </div>
  );
};

export default GlyphGraph;
