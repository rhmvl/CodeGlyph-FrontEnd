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
  cameraState = { offsetX: 0, offsetY: 0, scale: 1 };
  
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

  // --- Camera drift / breathing / parallax ---
  drift = { x: 0, y: 0, rot: 0 };
  driftTarget = { x: 0, y: 0, rot: 0 };
  lastDriftChange = 0;
  lastInteraction = performance.now();
  mouse = { x: 0, y: 0 };
  idle = true;

  // effect tuning
  readonly DRIFT_INTENSITY = 30;
  readonly DRIFT_ROT_INTENSITY = 0.004;
  readonly DRIFT_INTERVAL = 4000;
  readonly BREATH_SCALE = 0.015;
  readonly PARALLAX_INTENSITY = 0.05;
  readonly IDLE_TIMEOUT = 1500;

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

  updateTheme(themeColors: ThemeColors) {
    this.nodes.forEach(n => n.updateTheme(themeColors));
    this.links.forEach(l => l.updateTheme(themeColors));
  }

  // updateMotion(motionSettings: MotionSettings) {
  //   this.nodes.forEach(n => n.updateMotion(motionSettings));
  //   this.links.forEach(l => l.updateMotion(motionSettings));
  //   // this.motionSettings = motionSettings;
  // }

  updateData(newData: CodeGlyphData) {
    // optionally update node metrics / values without recreating layout
    newData.nodes.forEach(updatedNode => {
      const node = this.nodes.find(n => n.data.id === updatedNode.id);
      if (node) Object.assign(node.data, updatedNode);
    });
  }

  /** Smooth camera drift + breathing + parallax logic */
  updateCamera(time: number) {
    const now = performance.now();
    // TODO: Fix this idle check
    this.idle = now - this.lastInteraction > this.IDLE_TIMEOUT;

    // Occasionally pick new drift targets
    if (now - this.lastDriftChange > this.DRIFT_INTERVAL) {
      this.lastDriftChange = now;
      this.driftTarget.x = (Math.random() * 2 - 1) * this.DRIFT_INTENSITY;
      this.driftTarget.y = (Math.random() * 2 - 1) * this.DRIFT_INTENSITY * 0.6;
      this.driftTarget.rot = (Math.random() * 2 - 1) * this.DRIFT_ROT_INTENSITY;
    }

    // Smooth drift
    this.drift.x += (this.driftTarget.x - this.drift.x) * 0.02;
    this.drift.y += (this.driftTarget.y - this.drift.y) * 0.02;
    this.drift.rot += (this.driftTarget.rot - this.drift.rot) * 0.02;

    // Breathing
    const breath = 1 + Math.sin(time / 3000) * this.BREATH_SCALE;

    // Parallax (based on mouse)
    const nx = (this.mouse.x / this.width) * 2 - 1;
    const ny = (this.mouse.y / this.height) * 2 - 1;
    const pFactor = this.idle ? 0.25 : 1;
    const px = -nx * this.width * this.PARALLAX_INTENSITY * pFactor;
    const py = -ny * this.height * this.PARALLAX_INTENSITY * pFactor;

    return { drift: { ...this.drift }, breath, px, py };
  }

  animate(time: number) {
    this.simulation.step();
    this.draw(time);
    this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }

  draw(time: number) {
    const ctx = this.ctx;
    // const { drift, breath, px, py } = this.updateCamera(time); 
    // const effectiveScale = this.scale * breath;
    // const effectiveOffsetX = this.offsetX + drift.x + px;
    // const effectiveOffsetY = this.offsetY + drift.y + py;
    const effectiveScale = this.scale;
    const effectiveOffsetX = this.offsetX;
    const effectiveOffsetY = this.offsetY;
    
    this.cameraState = {
      offsetX: effectiveOffsetX,
      offsetY: effectiveOffsetY,
      scale: effectiveScale,
    };

    ctx.save();

    ctx.setTransform(effectiveScale, 0, 0, effectiveScale, effectiveOffsetX, effectiveOffsetY);
    ctx.clearRect(
      -effectiveOffsetX / effectiveScale,
      -effectiveOffsetY / effectiveScale,
      this.width / effectiveScale,
      this.height / effectiveScale
    );

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
