import type { ProjectMetrics, ThemeColors } from './types';

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, "");
  const num = parseInt(hex, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)]
    .map(x => Math.round(x * 255)
    .toString(16)
    .padStart(2, "0"))
    .join("")}`;
}

function adjustColor(hex: string, hueShift = 0, satMult = 1, lightMult = 1): string {
  const { h, s, l } = hexToHsl(hex);
  const newH = (h + hueShift + 360) % 360;
  const newS = Math.min(100, s * satMult);
  const newL = Math.min(100, l * lightMult);
  return hslToHex(newH, newS, newL);
}

export function generateThemeFromMetrics(metrics: ProjectMetrics): ThemeColors {
  const {
    totalFiles,
    totalLOC,
    averageComplexity,
    averageDepth,
    dependencies,
  } = metrics;

  // Normalize metrics (clamped 0–1)
  const complexityFactor = Math.min(averageComplexity / 15, 1); // assume 15 is "very high"
  const depthFactor = Math.min(averageDepth / 10, 1);
  const depFactor = Math.min(dependencies / 50, 1);
  const sizeFactor = Math.min(totalLOC / 50000, 1); // 50k LOC ~ large project

  // Base HSL mapping
  const hue = 220 - complexityFactor * 180; // blue → red spectrum
  const saturation = 40 + depFactor * 50; // 40–90%
  const lightness = 70 - sizeFactor * 30; // 70–40%

  const node = hslToHex(hue, saturation, lightness);
  const nodeBorder = hslToHex(hue, saturation * 0.7, lightness * 0.8);
  const aura = hslToHex(hue, saturation * 0.5, lightness * 1.2);
  const edge = hslToHex((hue + 20) % 360, saturation * 0.8, lightness * 0.6);
  const background = hslToHex(hue, saturation * 0.2, 10 + lightness * 0.3);

  // Derived colors
  const glowSoft = hslToHex(hue, saturation * 0.5, lightness * 1.3);
  const glowStrong = hslToHex(hue, saturation, lightness * 1.1);
  const textPrimary = hslToHex(hue, 20, 90);
  const textSecondary = hslToHex(hue, 15, 70);
  const importEdge = hslToHex((hue + 40) % 360, saturation, lightness * 0.8);
  const callEdge = hslToHex((hue - 40 + 360) % 360, saturation, lightness * 0.8);
  const containsEdge = hslToHex((hue + 180) % 360, saturation * 0.6, lightness * 0.5);

  return {
    node,
    nodeBorder,
    aura,
    edge,
    importEdge,
    callEdge,
    glowSoft,
    glowStrong,
    textPrimary,
    textSecondary,
    containsEdge,
    background,
  };
}

export function generateThemeFromBase(
  metrics: ProjectMetrics,
  base: ThemeColors
): ThemeColors {
  const complexityFactor = Math.min(metrics.averageComplexity / 15, 1);
  const depthFactor = Math.min(metrics.averageDepth / 10, 1); // now used
  const depFactor = Math.min(metrics.dependencies / 50, 1);
  const sizeFactor = Math.min(metrics.totalLOC / 50000, 1);

  // Combine effects:
  // - complexity mostly drives warm/cool hue shifts
  // - depth nudges hue & saturation (deeper stacks => slightly warmer + more saturated)
  // - dependencies increase saturation
  // - size makes things darker
  const hueShift =
    complexityFactor * 40 - 20 + // -20..+20 from complexity
    depthFactor * 10; // additional +0..+10° from depth (deeper -> slightly warmer)
  const satMult = 1 + depFactor * 0.3 + depthFactor * 0.2; // more deps + deeper => more saturated
  const lightMult = 1 - sizeFactor * 0.2 - depthFactor * 0.05; // large projects + depth = slightly darker

  // Use depthFactor to increase aura/glow intensity and nodeBorder contrast
  const auraLightBoost = 1 + depthFactor * 0.12;
  const glowLightBoost = 1 + depthFactor * 0.18;
  const borderDarken = 0.88 - depthFactor * 0.05; // deeper => slightly darker border

  return {
    node: adjustColor(base.node, hueShift, satMult, lightMult),
    nodeBorder: adjustColor(base.nodeBorder ?? base.node, hueShift, satMult, lightMult * borderDarken),
    aura: adjustColor(base.aura ?? base.node, hueShift / 2, satMult * 0.9, lightMult * auraLightBoost),
    edge: adjustColor(base.edge ?? base.node, hueShift * 1.2, satMult * 1.05, lightMult * 0.95),
    importEdge: adjustColor(base.importEdge ?? base.edge ?? base.node, hueShift + 8, satMult, lightMult),
    callEdge: adjustColor(base.callEdge ?? base.edge ?? base.node, hueShift - 8, satMult, lightMult),
    glowSoft: adjustColor(base.glowSoft ?? base.aura ?? base.node, hueShift / 2, 1, lightMult * glowLightBoost),
    glowStrong: adjustColor(base.glowStrong ?? base.aura ?? base.node, hueShift, satMult, lightMult * (1 + depthFactor * 0.08)),
    textPrimary: adjustColor(base.textPrimary ?? "#ffffff", 0, 1, 1),
    textSecondary: adjustColor(base.textSecondary ?? "#cccccc", 0, 1, 1.02),
    containsEdge: adjustColor(base.containsEdge ?? base.edge ?? base.node, hueShift + 180, satMult * 0.7, lightMult * 0.9),
    background: adjustColor(base.background, hueShift / 3, 1, Math.max(0.06, lightMult * 0.92)),
  };
}

