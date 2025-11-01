import type { GraphLink as LinkData, ThemeColors, MotionSettings } from '../../../utils/types';
import type { GraphNode } from './GraphNode';

export interface GraphLinkProps {
  data: LinkData;
  source: GraphNode;
  target: GraphNode;
  themeColors: ThemeColors;
  motionSettings: MotionSettings;
}

export class GraphLink {
  data: LinkData;
  source: GraphNode;
  target: GraphNode;
  themeColors: ThemeColors;
  motionSettings: MotionSettings;
  isHovered = false;

  constructor(props: GraphLinkProps) {
    this.data = props.data;
    this.source = props.source;
    this.target = props.target;
    this.themeColors = props.themeColors;
    this.motionSettings = props.motionSettings;
  }

  setHover(state: boolean) {
    this.isHovered = state;
  }
  
  updateTheme(themeColors: ThemeColors, motionSettings: MotionSettings) {
    this.themeColors = themeColors;
    this.motionSettings = motionSettings;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const { source, target, data, themeColors, motionSettings } = this;

    // Use smooth positions from motion values
    const sx = source.mx?.get() ?? source.x;
    const sy = source.my?.get() ?? source.y;
    const tx = target.mx?.get() ?? target.x;
    const ty = target.my?.get() ?? target.y;

    const baseWidth = 1 + (source.data.metrics?.complexity || 1) * 0.1;

    // --- pulse animation ---   
    let pulseMultiplier = 1;
    if (data.relation === 'calls') {
      const tension = source.data.emotion?.tension || 0.5;
      pulseMultiplier = 1 + 0.2 * Math.sin(time * 0.005 * motionSettings.pulseSpeed + tension * Math.PI);
    }

    if (this.isHovered) pulseMultiplier *= 2;

    let lineDash: number[] = [];
    let strokeColor = themeColors.edge;
    let opacity = 0.6;

    switch (data.relation) {
      case 'imports':
        lineDash = [6, 4];
        strokeColor = themeColors.importEdge || themeColors.edge;
        opacity = 0.5 + 0.2 * Math.sin(time * 0.002);
        break;
      case 'contains':
        lineDash = [];
        strokeColor = themeColors.containsEdge || themeColors.edge;
        opacity = 0.4 + 0.15 * Math.sin(time * 0.003);
        break;
      case 'calls':
        lineDash = [];
        strokeColor = themeColors.edge;
        opacity = 0.7 + 0.2 * Math.sin(time * 0.005);
        break;
      default:
        lineDash = [];
        strokeColor = themeColors.edge;
        opacity = 0.6;
    }

    // --- draw halo ---
    ctx.save();
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 4 * pulseMultiplier;
    ctx.globalAlpha = opacity;
    ctx.setLineDash(lineDash);
    ctx.lineWidth = baseWidth * pulseMultiplier;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    // --- main line ---
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = baseWidth;
    ctx.setLineDash(lineDash);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    ctx.setLineDash([]);
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
