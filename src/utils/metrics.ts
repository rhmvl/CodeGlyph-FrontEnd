import type { ProjectMetrics } from "./types";

export function computeMetricRanges(projects: ProjectMetrics[]) {
  const metrics = ["averageComplexity", "averageDepth", "totalLOC", "dependencies"];
  const ranges: Record<string, { min: number; max: number }> = {};

  for (const key of metrics) {
    const values = projects.map(p => p[key as keyof ProjectMetrics] as number);
    ranges[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  return ranges;
}

export function normalize(value: number, min: number, max: number) {
  if (max === min) return 0.5; // avoid divide-by-zero
  return (value - min) / (max - min);
}

export function getMetricColor(value: number, min: number, max: number): string {
  const t = normalize(value, min, max); // 0 → 1
  // Interpolate hue: blue (210°) → red (10°)
  const hue = 210 - t * 200;
  const saturation = 70;
  const lightness = 55 - t * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
