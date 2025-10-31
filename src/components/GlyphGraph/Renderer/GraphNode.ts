import type { GraphNode as NodeData } from '../../../utils/types';

export class GraphNode {
  data: NodeData;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;

  constructor(node: NodeData, x = 0, y = 0) {
    this.data = node;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = (node.style?.size || 1) * 10;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.data.style?.color || '#3b82f6';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // label
    ctx.fillStyle = '#ccc';
    ctx.font = '10px sans-serif';
    ctx.fillText(this.data.name, this.x + this.radius + 4, this.y + 3);
  }

  isPointInside(px: number, py: number) {
    return Math.hypot(this.x - px, this.y - py) <= this.radius;
  }
}
