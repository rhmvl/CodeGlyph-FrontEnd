import type { CodeGlyphData, MotionSettings, ThemeColors } from '../../../utils/types';
import { initCanvas } from './GraphCanvas';
import { GraphNode } from './GraphNode';
import { GraphLink } from './GraphLink';
import { GraphSimulation } from './GraphSimulation';

export class GraphRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nodes: GraphNode[];
  links: GraphLink[];
  simulation: GraphSimulation;
  width: number;
  height: number;
  animationFrame: number | null = null;

  // Transformation
  offsetX = 0;
  offsetY = 0;
  scale = 1;
  readonly MIN_SCALE = 0.2;
  readonly MAX_SCALE = 5;

  // Dragging
  draggingNode: GraphNode | null = null;
  dragOffsetX = 0;
  dragOffsetY = 0;

  constructor(canvasElement: HTMLCanvasElement, data: CodeGlyphData, width: number, 
              height: number, themeColors: ThemeColors, motionSettings: MotionSettings) {
    const { canvas, ctx } = initCanvas(canvasElement, width, height);
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    // --- create nodes ---
    const rootNode = new GraphNode({
      data: {
        id: "project",
        name: data.project.name,
        type: 'project',
        metrics: { ...data.project.metrics, loc: data.project.metrics.totalLOC },
        style: { color: '#888', size: 2 },
      },
      x: width / 2,
      y: height / 2,
      themeColors,
      motionSettings
    });

    this.nodes = [
      rootNode,
      ...data.nodes.map(n => new GraphNode({
        data: n,
        x: Math.random() * width,
        y: Math.random() * height,
        themeColors,
        motionSettings
      }))
    ];

    const nodesMap = new Map(this.nodes.map(n => [n.data.id, n]));
    this.links = data.links
    .map(l => {
      const source = nodesMap.get(l.source);
      const target = nodesMap.get(l.target);
      if (!source || !target) return null;
      return new GraphLink({
        data: l,
        source: source,
        target: target,
        themeColors,
        motionSettings
      });
    })
    .filter(Boolean) as GraphLink[];

    this.simulation = new GraphSimulation(this.nodes, this.links, width, height);

    // --- events ---
    this.addEventListeners();
    this.animate(1);
  }

  animate(time: number) {
    this.simulation.step();
    this.draw(time);
    this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }

  draw(time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
    ctx.clearRect(-this.offsetX / this.scale, -this.offsetY / this.scale, this.width / this.scale, this.height / this.scale);

    this.links.forEach(l => l.draw(ctx, time));
    this.nodes.forEach(n => n.draw(ctx, time));
    ctx.restore();
  }

  getNodeAt(x: number, y: number) {
    // Convert screen coords to graph coords
    const graphX = (x - this.offsetX) / this.scale;
    const graphY = (y - this.offsetY) / this.scale;
    return this.nodes.find(n => n.isPointInside(graphX, graphY)) || null;
  }

  addEventListeners() {
    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      const node = this.getNodeAt(e.offsetX, e.offsetY);
      if (node) {
        this.draggingNode = node;
        node.fixed = true;
        const graphX = (e.offsetX - this.offsetX) / this.scale;
        const graphY = (e.offsetY - this.offsetY) / this.scale;
        this.dragOffsetX = graphX - node.x;
        this.dragOffsetY = graphY - node.y;
      } else {
        isPanning = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (this.draggingNode) {
        const graphX = (e.offsetX - this.offsetX) / this.scale;
        const graphY = (e.offsetY - this.offsetY) / this.scale;

        // Update simulation positions
        this.draggingNode.x = graphX - this.dragOffsetX;
        this.draggingNode.y = graphY - this.dragOffsetY;

        // Immediately set motion values to match
        this.draggingNode.mx.set(this.draggingNode.x);
        this.draggingNode.my.set(this.draggingNode.y);
      } else if (isPanning) {
        this.offsetX += e.offsetX - lastX;
        this.offsetY += e.offsetY - lastY;
        lastX = e.offsetX;
        lastY = e.offsetY;
      }
    };

    const onMouseUp = () => {
      if (this.draggingNode)
        this.draggingNode.fixed = false;
      this.draggingNode = null;
      isPanning = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleFactor = 1.1;
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      const delta = e.deltaY < 0 ? scaleFactor : 1 / scaleFactor;
      let newScale = this.scale * delta;

      // clamp zoom
      newScale = Math.min(Math.max(newScale, this.MIN_SCALE), this.MAX_SCALE);

      // adjust offset to keep zoom centered on cursor
      this.offsetX = mouseX - ((mouseX - this.offsetX) / this.scale) * newScale;
      this.offsetY = mouseY - ((mouseY - this.offsetY) / this.scale) * newScale;

      this.scale = newScale;
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    this.canvas.addEventListener('mousemove', onMouseMove);
    this.canvas.addEventListener('mouseup', onMouseUp);
    this.canvas.addEventListener('mouseleave', onMouseUp);
    this.canvas.addEventListener('wheel', onWheel, { passive: false });
  }

  destroy() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }
}
