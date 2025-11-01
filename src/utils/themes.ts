import type { ThemeColors } from './types';

export const Themes = {
  dark: {
    background: '#0d1117',
    node: '#3b82f6',
    nodeBorder: '#1e293b',
    aura: '#60a5fa',
    edge: '#475569',
    importEdge: '#8b5cf6',
    containsEdge: '#22c55e',
    callEdge: '#facc15',
    glowSoft: '#3b82f6',
    glowStrong: '#60a5fa',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
  } satisfies ThemeColors,

  light: {
    background: '#f8fafc',
    node: '#2563eb',
    nodeBorder: '#cbd5e1',
    aura: '#60a5fa',
    edge: '#94a3b8',
    importEdge: '#a855f7',
    containsEdge: '#16a34a',
    callEdge: '#eab308',
    glowSoft: '#60a5fa',
    glowStrong: '#3b82f6',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
  } satisfies ThemeColors,
};

export type ThemeName = keyof typeof Themes;
