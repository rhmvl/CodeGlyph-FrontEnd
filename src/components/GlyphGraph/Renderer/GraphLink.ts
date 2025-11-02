import { motionValue, MotionValue } from "framer-motion";
import { animateColor, blendColor } from "../../../utils/colors";
import type { GraphLink as LinkData, ThemeColors, MotionSettings } from "../../../utils/types";
import type { GraphNode } from "./GraphNode";

/**
 * GraphLink — visual + behavioral representation of a connection between nodes.
 *
 * Responsibilities:
 * - Visually connects two GraphNodes.
 * - Encodes relationship type (contains, imports, calls) through color & style.
 * - Responds to node emotion and metrics for glow and thickness.
 * - Supports hover highlighting and smooth theme transitions.
 *
 * Visual Mapping:
 *  - relation: base hue (imports → cyan, calls → amber, contains → blue-gray)
 *  - source.complexity: line width
 *  - source.emotion.tension: glow color / pulse
 *  - source.emotion.harmony: opacity
 */
export class GraphLink {
  data: LinkData;
  source: GraphNode;
  target: GraphNode;
  themeColors: ThemeColors;
  motionSettings: MotionSettings;
  isHovered = false;

  mStrokeColor: MotionValue<string>;
  mGlowColor: MotionValue<string>;
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

    // initialize motion values
    this.mStrokeColor = motionValue(this.resolveRelationColor());
    this.mGlowColor = motionValue(this.resolveRelationColor());
    this.mOpacity = motionValue(0.7);
  }

  private resolveRelationColor(): string {
    const { data } = this;
    switch (data.relation) {
      case "contains": return "#A0AEC0"; // gray-blue
      case "imports": return "#FFD93D";  // yellow
      case "calls": return "#FF6B6B";    // red
      case "inherits": return "#6BCB77"; // green
      default: return "#999999";         // fallback neutral gray
    }
  }

  private computeGlowIntensity(): number {
    const tension = this.source.data.emotion?.tension ?? 0.0;
    return 8 + tension * 12; // range: 8–20
  }

  setHover(state: boolean) {
    this.isHovered = state;
    const targetOpacity = state ? 1.0 : 0.7;
    this.mOpacity.set(targetOpacity);
  }

  updateTheme(themeColors: ThemeColors) {
    const prev = this.themeColors;
    this.themeColors = themeColors;
    const baseColor = this.resolveRelationColor();

    animateColor(this.mStrokeColor, prev.edge, baseColor, 0.5);
    animateColor(this.mGlowColor, prev.edge, baseColor, 0.5);
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const { source, target, motionSettings } = this;

    const sx = source.mx?.get() ?? source.x;
    const sy = source.my?.get() ?? source.y;
    const tx = target.mx?.get() ?? target.x;
    const ty = target.my?.get() ?? target.y;

    // --- Compute base width + pulse ---
    const baseWidth = 0.8 + (source.data.metrics?.complexity || 1) * 0.08;
    const pulse =
      1 +
      0.25 *
        Math.sin(
          time * 0.004 * motionSettings.pulseSpeed +
            (source.data.emotion?.tension ?? 0.5) * Math.PI
        );

    const strokeColor = this.mStrokeColor.get();
    const glowColor = this.mGlowColor.get();
    const opacity = this.mOpacity.get();
    const tension = source.data.emotion?.tension ?? 0.0;

    const sourceColor = source.data.style?.color ?? this.themeColors.node;
    const blended = blendColor(sourceColor, strokeColor, 0.6);

    // --- Gradient coloring along line ---
    const grad = ctx.createLinearGradient(sx, sy, tx, ty);
    grad.addColorStop(0, blended + "80");
    grad.addColorStop(0.5, blended + "FF");
    grad.addColorStop(1, blended + "80");

    // --- Dynamic glow intensity (tension-based) ---
    const glowBlur = this.computeGlowIntensity() * pulse * (1 + tension * 0.5);
    const glowFlicker =
      glowBlur * (1 + 0.15 * Math.sin(time * 0.02 * (5 + tension * 10)));

    // --- Glow layer ---
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowFlicker;
    ctx.globalAlpha = opacity * 0.6;
    ctx.lineWidth = baseWidth * pulse * 2.0;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = grad;
    ctx.stroke();
    ctx.restore();

    // --- Main line ---
    ctx.save();
    ctx.lineWidth = baseWidth;
    ctx.strokeStyle = grad;
    ctx.globalAlpha = Math.min(1, opacity + 0.2);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    // --- Optional directional arrow for imports/calls ---
    if (["imports", "calls"].includes(this.data.relation ?? "")) {
      const dx = tx - sx;
      const dy = ty - sy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 10) {
        const nx = dx / len;
        const ny = dy / len;
        const arrowSize = 5 + 3 * tension;
        const ax = tx - nx * 6;
        const ay = ty - ny * 6;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(Math.atan2(dy, dx));
        ctx.fillStyle = strokeColor;
        ctx.globalAlpha = opacity * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-arrowSize, arrowSize * 0.6);
        ctx.lineTo(-arrowSize, -arrowSize * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
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

