import projectData from '../../tmp/json-schema.json';
import type { CodeGlyphData } from './types';

export function loadCodeGlyphData(): CodeGlyphData {
  return projectData as CodeGlyphData;
}

export async function loadCodeGlyphDataFromBackend(url: string): Promise<CodeGlyphData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load data from ${url}: ${response.statusText}`);
  }
  const data = (await response.json()) as CodeGlyphData;
  return data;
}
