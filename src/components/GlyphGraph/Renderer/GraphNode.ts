import { MotionValue, motionValue, animate } from "framer-motion";
import type { GraphNode as NodeData, ThemeColors, MotionSettings } from "../../../utils/types";
import { animateColor, blendColor } from "../../../utils/colors";

/**
 * GraphNode — visual + behavioral representation of a single code entity.
 *
 * Responsibilities:
 * - Render visual representation based on metrics and emotions.
 * - Handle interactive states (hover, click, drag).
 * - Support animations (pulse, glow, breathing, ripple).
 *
 * Emotional Mapping:
 *  - complexity: base color gradient (blue → yellow → red)
 *  - LOC: saturation / radius scale
 *  - emotion.tension: glow hue (teal → magenta)
 *  - emotion.harmony: border brightness (low = dim, high = bright)
 */
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
  mNodeColor: MotionValue<string>;
  mAuraColor: MotionValue<string>;
  mBorderColor: MotionValue<string>;

  themeColors: ThemeColors;
  motionSettings: MotionSettings;
  isHovered: boolean;
  fixed: boolean = false;
  pulseOffset: number;

  // internal ripple state
  private rippleRadius = 0;
  private rippleAlpha = 0;
  private rippleActive = false;

  constructor(props: {
    data: NodeData;
    x: number;
    y: number;
    themeColors: ThemeColors;
    motionSettings: MotionSettings;
    isHovered?: boolean;
  }) {
    this.data = props.data;
    this.x = props.x;
    this.y = props.y;
    this.vx = 0;
    this.vy = 0;
    this.themeColors = props.themeColors;
    this.motionSettings = props.motionSettings;
    this.isHovered = props.isHovered || false;
    this.pulseOffset = Math.random() * Math.PI * 2;

    // radius scaling by LOC
    const MIN_LOC = 10;
    const MAX_LOC = 500;
    const loc = this.data.metrics?.loc ?? MIN_LOC;
    const clampedLoc = Math.min(Math.max(loc, MIN_LOC), MAX_LOC);
    this.radius =
      (((clampedLoc - MIN_LOC) / (MAX_LOC - MIN_LOC)) * 10 + 10) *
      (this.data.style?.size || 1) *
      this.motionSettings.sizeScale;

    // initialize motion values
    this.mx = motionValue(this.x);
    this.my = motionValue(this.y);
    this.mRadius = motionValue(this.radius);
    this.mGlow = motionValue((this.data.metrics?.complexity || 1) * this.motionSettings.glowIntensity);
    this.mNodeColor = motionValue(this.themeColors.node);
    this.mAuraColor = motionValue(this.themeColors.aura);
    this.mBorderColor = motionValue(this.themeColors.nodeBorder);
  }

  /** Sets hover animation */
  setHover(state: boolean) {
    if (state !== this.isHovered) {
      this.isHovered = state;
      const baseGlow =
        (this.data.metrics?.complexity || 1) * this.motionSettings.glowIntensity;
      animate(this.mGlow, state ? baseGlow * 1.6 : baseGlow, { duration: 0.3 });

      if (state) this.triggerRipple();
    }
  }

  /** Triggers a one-time ripple wave */
  private triggerRipple() {
    this.rippleActive = true;
    this.rippleRadius = this.radius * 1.2;
    this.rippleAlpha = 0.5;
  }

  /** Smooth position + size update */
  updateMotion(targetX: number, targetY: number, targetRadius?: number, targetGlow?: number) {
    animate(this.mx, targetX, { duration: 0.3 });
    animate(this.my, targetY, { duration: 0.3 });
    if (targetRadius !== undefined) animate(this.mRadius, targetRadius, { duration: 0.3 });
    if (targetGlow !== undefined) animate(this.mGlow, targetGlow, { duration: 0.3 });
  }

  /** Theme transition */
  updateTheme(themeColors: ThemeColors) {
    const prev = this.themeColors;
    this.themeColors = themeColors;
    animateColor(this.mNodeColor, prev.node, themeColors.node);
    animateColor(this.mAuraColor, prev.aura, themeColors.aura);
    animateColor(this.mBorderColor, prev.nodeBorder, themeColors.nodeBorder);
  }

  /** Computes base node color from complexity */
  private complexityColor(): string {
    const c = this.data.metrics?.complexity ?? 0;
    if (c < 3) return "#39A0ED"; // calm blue
    if (c < 6) return "#FFD93D"; // medium yellow
    return "#FF6B6B"; // hot red
  }

  /** Computes glow color from emotion.tension (0–1) */
  private tensionColor(): string {
    const tension = Math.min(Math.max(this.data.emotion?.tension ?? 0, 0), 1);
    const start = "#00E5C0";
    const end = "#FF00FF";
    return blendColor(start, end, tension);
  }

  /** Computes border brightness from emotion.harmony (0–1) */
  private harmonyColor(): number {
    const harmony = Math.min(Math.max(this.data.emotion?.harmony ?? 0.5, 0), 1);
    return 0.3 + harmony * 0.7;
  }

  /** Main draw function */
  draw(ctx: CanvasRenderingContext2D, time: number) {
    const baseColor = blendColor(this.data.style?.color, this.complexityColor(), 0.3);
    const auraColor = blendColor(this.data.style?.highlightColor, this.tensionColor(), 0.3);
    const borderColor = this.mBorderColor.get();

    const pulse = 1 + 0.05 * Math.sin(time * 0.005 * this.motionSettings.pulseSpeed + this.pulseOffset);
    const breath = 1 + 0.02 * Math.sin(time * 0.0015 + this.pulseOffset); // slower breathing

    const radius = this.mRadius.get() * pulse * breath;
    const glow = this.mGlow.get() * pulse;

    // blend node color with theme
    const bNodeColor = blendColor(baseColor, this.mNodeColor.get(), 0.3);
    const bAuraColor = blendColor(auraColor, this.mAuraColor.get(), 0.3);

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(this.mx.get(), this.my.get(), radius * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = bNodeColor;
    ctx.shadowColor = bAuraColor;
    ctx.shadowBlur = glow;
    ctx.fill();
    ctx.restore();

    // border (affected by harmony)
    ctx.save();
    ctx.globalAlpha = this.harmonyColor();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(this.mx.get(), this.my.get(), radius * 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // optional ripple effect
    if (this.rippleActive) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.mx.get(), this.my.get(), this.rippleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = auraColor;
      ctx.globalAlpha = this.rippleAlpha;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      this.rippleRadius += 1.5; // expand outward
      this.rippleAlpha *= 0.96; // fade out
      if (this.rippleAlpha < 0.02) this.rippleActive = false;
    }

    // label
    ctx.save();
    ctx.fillStyle = this.themeColors.textSecondary ?? "#ccc";
    ctx.font = "10px monospace";
    ctx.fillText(this.data.name, this.mx.get() + radius * 1.1 + 4, this.my.get() + 3);
    ctx.restore();
  }

  /** Hit test */
  isPointInside(px: number, py: number) {
    return Math.hypot(this.mx.get() - px, this.my.get() - py) <= this.mRadius.get();
  }
}
