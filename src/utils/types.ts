export type LinkRelation = 'contains' | 'imports' | 'calls';

export interface ProjectMetrics {
  totalFiles: number;
  totalLOC: number;
  averageComplexity: number;
  averageDepth: number;
  dependencies: number;
  functions: number;
  classes: number;
}

export interface VisualDefaults {
  colorScale: string;
  sizeScale: string;
  layout: string;
  theme: string;
}

export interface AnalysisSettings {
  complexityThreshold: number;
  ignorePatterns: string[];
  includeDocstrings: boolean;
}

export interface ProjectConfig {
  visualDefaults: VisualDefaults;
  analysisSettings: AnalysisSettings;
}

export interface ProjectInfo {
  id: string;
  name: string;
  language: string[];
  version: string;
  createdAt: string;
  lastScanned: string;
  sourcePath: string;
  metrics: ProjectMetrics;
  config: ProjectConfig;
}

export interface NodeEmotion {
  tension?: number;
  stability?: number;
  harmony?: number;
}

export interface NodeStyle {
  color?: string;
  highlightColor?: string;
  size?: number;
}

export interface NodeMetrics {
  loc?: number;
  complexity?: number;
  imports?: number;
  classes?: number;
  functions?: number;
  methods?: number;
  calls?: number;
  lastModified?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  parent?: string;
  path?: string;
  tags?: string[];
  status?: string;
  metrics?: NodeMetrics;
  emotion?: NodeEmotion;
  style?: NodeStyle;
  calls?: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  relation: LinkRelation;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Metadata {
  generator: string;
  schemaVersion: string;
  exportedAt: string;
  engine: {
    languageSupport: string[];
    analysisTimeMs: number;
  };
}

export interface CodeGlyphData {
  project: ProjectInfo;
  nodes: GraphNode[];
  links: GraphLink[];
  metadata: Metadata;
}

export interface ThemeColors {
  node: string;
  nodeBorder: string;
  aura: string;
  edge: string;
  importEdge?: string;
  callEdge?: string;
  glowSoft?: string;
  glowStrong?: string;
  textPrimary?: string;
  textSecondary?: string;
  containsEdge?: string;
  background: string;
}

export interface MotionSettings {
  glowIntensity: number;
  pulseSpeed: number;
  sizeScale: number;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  motion: MotionSettings;
}
