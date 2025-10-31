import type { GraphLink as LinkData } from '../../../utils/types';
import { GraphNode } from './GraphNode';

export class GraphLink {
  data: LinkData;
  source: GraphNode;
  target: GraphNode;

  constructor(link: LinkData, nodesMap: Map<string, GraphNode>) {
    this.data = link;
    this.source = nodesMap.get(link.source)!;
    this.target = nodesMap.get(link.target)!;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1.4;
    ctx.moveTo(this.source.x, this.source.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.stroke();
  }
}
