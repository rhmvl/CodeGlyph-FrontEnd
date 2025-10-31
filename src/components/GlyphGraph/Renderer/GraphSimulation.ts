import { GraphNode } from './GraphNode';
import { GraphLink } from './GraphLink';

export class GraphSimulation {
  nodes: GraphNode[];
  links: GraphLink[];
  width: number;
  height: number;
  alpha = 0.1; // damping factor

  constructor(nodes: GraphNode[], links: GraphLink[], width: number, height: number) {
    this.nodes = nodes;
    this.links = links;
    this.width = width;
    this.height = height;
  }

  step() {
    // link force
    this.links.forEach(l => {
      const dx = l.target.x - l.source.x;
      const dy = l.target.y - l.source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const desired = 150;
      const force = (distance - desired) * 0.01;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    });

    // repulsion / collision
    this.nodes.forEach((n1, i) => {
      this.nodes.slice(i + 1).forEach(n2 => {
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy;
        if (distSq === 0) return;
        const minDist = n1.radius + n2.radius + 20;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          const overlap = (minDist - dist) / 2;
          const offsetX = (dx / dist) * overlap;
          const offsetY = (dy / dist) * overlap;

          n1.x -= offsetX;
          n1.y -= offsetY;
          n2.x += offsetX;
          n2.y += offsetY;
        }
      });
    });

    // update positions
    this.nodes.forEach(n => {
      n.vx *= 0.9;
      n.vy *= 0.9;
      n.x += n.vx;
      n.y += n.vy;
    });
  }
}
