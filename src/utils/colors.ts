import { animate, mixColor, MotionValue } from 'framer-motion';

export function animateColor(
  motionVal: MotionValue<string>,
  from: string,
  to: string,
  duration = 0.25
) {
  motionVal.stop();

  const mixer = mixColor(from, to);

  animate(0, 1, {
    duration,
    ease: "easeOut",
    onUpdate: (latest) => {
      motionVal.set(mixer(latest) as string);
    },
  });
}

export function lerpColor(c1: string, c2: string, t: number) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export function addAlpha(color: string, alpha: number) {
  const [r, g, b] = hexToRgb(color);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function adjustColorBrightness(color: string, factor: number) {
  const [r, g, b] = hexToRgb(color);
  const f = 1 + factor;
  return `rgb(${Math.min(255, r * f)},${Math.min(255, g * f)},${Math.min(255, b * f)})`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return [128, 128, 128];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
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

export function hslToHex(h: number, s: number, l: number): string {
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

export function adjustColor(hex: string, hueShift = 0, satMult = 1, lightMult = 1): string {
  const { h, s, l } = hexToHsl(hex);
  const newH = (h + hueShift + 360) % 360;
  const newS = Math.min(100, s * satMult);
  const newL = Math.min(100, l * lightMult);
  return hslToHex(newH, newS, newL);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360; // normalize
  s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const t = [hk + 1/3, hk, hk - 1/3];
  const cols = t.map(tc => {
    let tt = tc;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1/6) return p + (q - p) * 6 * tt;
    if (tt < 1/2) return q;
    if (tt < 2/3) return p + (q - p) * (2/3 - tt) * 6;
    return p;
  });
  return [Math.round(cols[0] * 255), Math.round(cols[1] * 255), Math.round(cols[2] * 255)];
}

/** Interpolate hue on shortest arc */
function interpHue(h1: number, h2: number, t: number): number {
  const d = ((h2 - h1 + 540) % 360) - 180; // shortest delta
  return (h1 + d * t + 360) % 360;
}

/**
 * Blend a source color toward a target theme color in HSL space.
 * strength: 0..1 (0 = keep source, 1 = become target)
 */
export function blendToTheme(srcHex: string, themeHex: string, strength = 0.7): string {
  const [r1,g1,b1] = hexToRgb(srcHex);
  const [r2,g2,b2] = hexToRgb(themeHex);
  const [h1,s1,l1] = rgbToHsl(r1,g1,b1);
  const [h2,s2,l2] = rgbToHsl(r2,g2,b2);

  const h = interpHue(h1, h2, strength);
  const s = s1 + (s2 - s1) * strength;
  const l = l1 + (l2 - l1) * strength;

  const [nr, ng, nb] = hslToRgb(h, s, l);
  return rgbToHex(nr, ng, nb);
}
