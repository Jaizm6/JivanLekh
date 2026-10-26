// SVG cover generators for notebooks
export const COVER_PRESETS: Array<[string, string]> = [
  ['Amber Sun', '<rect width="300" height="400" fill="#f59e0b"/>'],
  ['Ocean Slate', '<rect width="300" height="400" fill="#3b82f6"/>'],
  ['Forest Sage', '<rect width="300" height="400" fill="#10b981"/>'],
  ['Plum Purple', '<rect width="300" height="400" fill="#8b5cf6"/>'],
  ['Rose Blush', '<rect width="300" height="400" fill="#ec4899"/>'],
  ['Graphite', '<rect width="300" height="400" fill="#374151"/>']
];

export function getCoverSvg(index: number | string): string {
  if (typeof index === 'string' && index.startsWith('data:')) return index;
  const idx = typeof index === 'number' ? Math.abs(index) % COVER_PRESETS.length : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">${COVER_PRESETS[idx][1]}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
