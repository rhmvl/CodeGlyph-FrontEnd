import { motionValue, MotionValue } from "framer-motion";
import { animateColor } from "../../../utils/colors";
import type { GraphLink as LinkData, ThemeColors, MotionSettings } from "../../../utils/types";
import type { GraphNode } from "./GraphNode";
import { blendToTheme } from "../../../utils/colors";

export class GraphLink {
  data: LinkData;
  source: GraphNode;
  target: GraphNode;
  themeColors: ThemeColors;
  motionSettings: MotionSettings;
  isHovered = false;

  mStrokeColor: MotionValue<string>;
  mGlowColor: MotionValue<string>;
  mBorderColor: MotionValue<string>;
  mOpacity: MotionValue<number>;

  constructor(props: {
    data: LinkData;
    source: GraphNode;
    target: GraphNode;
    themeColors: ThemeColors;
    motionSettings: MotionSettings;
  }) {
    this.data = props.data;
    this.source = props.source;
    this.target = props.target;
    this.themeColors = props.themeColors;
    this.motionSettings = props.motionSettings;

    // initialize motion values from theme
    this.mStrokeColor = motionValue(this.resolveBaseColor());
    this.mGlowColor = motionValue(props.themeColors.edge);
    this.mBorderColor = motionValue(props.themeColors.edge);
    this.mOpacity = motionValue(0.7);
  }

  private resolveBaseColor(): string {
    const { data, themeColors } = this;
    switch (data.relation) {
      case "imports": return themeColors.importEdge || themeColors.edge;
      case "contains": return themeColors.containsEdge || themeColors.edge;
      case "calls": return themeColors.callEdge || themeColors.edge;
      default: return themeColors.edge;
    }
  }
  
  setHover(state: boolean) {
    this.isHovered = state;
  }
  
  updateTheme(themeColors: ThemeColors) {
    const prev = this.themeColors;
    this.themeColors = themeColors;

    animateColor(this.mStrokeColor, this.resolveBaseColor(), this.resolveBaseColor(), 0.5);
    animateColor(this.mGlowColor, prev.edge, themeColors.edge, 0.5);
    animateColor(this.mBorderColor, prev.edge, themeColors.edge, 0.5);
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const { source, target, motionSettings } = this;

    const sx = source.mx?.get() ?? source.x;
    const sy = source.my?.get() ?? source.y;
    const tx = target.mx?.get() ?? target.x;
    const ty = target.my?.get() ?? target.y;

    const baseWidth = 0.8 + (source.data.metrics?.complexity || 1) * 0.08;
    const pulse =
      1 + 0.2 * Math.sin(time * 0.004 * motionSettings.pulseSpeed + (source.data.emotion?.tension ?? 0.5) * Math.PI);
    const opacity = this.mOpacity.get();

    const strokeColor = this.mStrokeColor.get();
    const glowColor = this.mGlowColor.get();
    const sourceColor = source.data.style?.color ?? this.themeColors.node;
    const blended = blendToTheme(sourceColor, strokeColor, 0.6);

    const grad = ctx.createLinearGradient(sx, sy, tx, ty);
    grad.addColorStop(0, blended + "80");
    grad.addColorStop(0.5, blended + "FF");
    grad.addColorStop(1, blended + "80");

    // Glow
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8 * pulse;
    ctx.globalAlpha = opacity * 0.6;
    ctx.lineWidth = baseWidth * pulse * 2.0;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = grad;
    ctx.stroke();
    ctx.restore();

    // Main line
    ctx.save();
    ctx.lineWidth = baseWidth;
    ctx.strokeStyle = grad;
    ctx.globalAlpha = Math.min(1, opacity + 0.2);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();
  }

  isPointInside(px: number, py: number): boolean {
    const { source, target } = this;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return false;

    const t = ((px - source.x) * dx + (py - source.y) * dy) / lengthSq;
    if (t < 0 || t > 1) return false;

    const projX = source.x + t * dx;
    const projY = source.y + t * dy;

    const distSq = (px - projX) ** 2 + (py - projY) ** 2;
    return distSq < 25;
  }
}
