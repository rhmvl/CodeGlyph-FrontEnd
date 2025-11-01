import { MotionValue, motionValue, animate } from 'framer-motion';
import type { GraphNode as NodeData, ThemeColors, MotionSettings } from '../../../utils/types';

export interface GraphNodeProps {
  data: NodeData;
  x: number;
  y: number;
  themeColors: ThemeColors;
  motionSettings: MotionSettings;
  isHovered?: boolean;
}

export class GraphNode {
  data: NodeData;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;

  // motion values
  mx: MotionValue<number>;
  my: MotionValue<number>;
  mRadius: MotionValue<number>;
  mGlow: MotionValue<number>;

  themeColors: ThemeColors;
  motionSettings: MotionSettings;
  isHovered: boolean;
  fixed: boolean=false;
  pulseOffset: number;

  constructor(props: GraphNodeProps) {
    this.data = props.data;
    this.x = props.x;
    this.y = props.y;
    this.vx = 0;
    this.vy = 0;
    this.themeColors = props.themeColors;
    this.motionSettings = props.motionSettings;
    this.isHovered = props.isHovered || false;
    this.pulseOffset = Math.random() * Math.PI * 2;
    
    // initialize radius based on metrics
    const MIN_LOC = 10;
    const MAX_LOC = 500;
    const loc = this.data.metrics?.loc ?? MIN_LOC;
    const clampedLoc = Math.min(Math.max(loc, MIN_LOC), MAX_LOC);

    // Scale radius consistently
    this.radius = (((clampedLoc - MIN_LOC) / (MAX_LOC - MIN_LOC)) * 10 + 10) * (this.data.style?.size || 1) * this.motionSettings.sizeScale;

    // motion values
    this.mx = motionValue(this.x);
    this.my = motionValue(this.y);
    this.mRadius = motionValue(this.radius);
    this.mGlow = motionValue((this.data.metrics?.complexity || 1) * this.motionSettings.glowIntensity);
  }

  setHover(state: boolean) {
    this.isHovered = state;
    animate(this.mGlow, state 
      ? (this.data.metrics?.complexity || 1) * this.motionSettings.glowIntensity * 1.5
      : (this.data.metrics?.complexity || 1) * this.motionSettings.glowIntensity, { duration: 0.3 });
  }

  updateMotion(targetX: number, targetY: number, targetRadius?: number, targetGlow?: number) {
    animate(this.mx, targetX, { duration: 0.3 });
    animate(this.my, targetY, { duration: 0.3 });
    if (targetRadius !== undefined) animate(this.mRadius, targetRadius, { duration: 0.3 });
    if (targetGlow !== undefined) animate(this.mGlow, targetGlow, { duration: 0.3 });
  }

  updateTheme(themeColors: ThemeColors) {
    this.themeColors = themeColors;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const nodeColor = this.data.style?.color || this.themeColors.node;
    const auraColor = this.data.style?.highlightColor || this.themeColors.aura;
    const pulse = 1 + 0.05 * Math.sin(time * 0.005 * this.motionSettings.pulseSpeed + this.pulseOffset);
    const radius = this.mRadius.get() * pulse;
    const glow = this.mGlow.get() * pulse;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.mx.get(), this.my.get(), radius * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = glow;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.restore();

    // border
    ctx.save();
    ctx.strokeStyle = this.themeColors.nodeBorder;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(this.mx.get(), this.my.get(), radius * 1.1, 0, Math.PI * 2);
    ctx.stroke();

    // label
    ctx.fillStyle = '#ccc';
    ctx.font = '10px sans-serif';
    ctx.fillText(this.data.name, this.mx.get() + radius * 1.1 + 4, this.my.get() + 3);
  }

  isPointInside(px: number, py: number) {
    return Math.hypot(this.mx.get() - px, this.my.get() - py) <= this.mRadius.get();
  }
}
