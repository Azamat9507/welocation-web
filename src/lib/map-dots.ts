import { CATEGORIES, type Category, type SpotMap } from "./api";

// One colour per category, also used by the legend
export const CATEGORY_COLORS: Record<Category, string> = {
  CAFE: "#d4955a",
  BEACH: "#4aa8ff",
  LAKE: "#3fd0c0",
  RIVER: "#8fd3ff",
  VIEWPOINT: "#c98bff",
  STAY: "#ffd34d",
  LEISURE: "#ff7a59",
  ATTRACTION: "#7ddc6f",
};

// Mainland, Jeju, Ulleungdo and Dokdo. Longitude is shrunk by cos(36°) so the peninsula keeps its shape.
export const LNG_MIN = 124.5;
const LNG_MAX = 131.95;
const LAT_MIN = 33.05;
const LAT_MAX = 38.65;
const X_SCALE = 80.4;
const Y_SCALE = 100;
export const WIDTH = Math.round((LNG_MAX - LNG_MIN) * X_SCALE);
export const HEIGHT = Math.round((LAT_MAX - LAT_MIN) * Y_SCALE);

export const project = (lat: number, lng: number) => [Math.round((lng - LNG_MIN) * X_SCALE), Math.round((LAT_MAX - lat) * Y_SCALE)];

export const LAYERS = 3;

// One SVG layer of map dots: every third dot of each category, one path per colour, each dot a zero-length
// round-capped line. Dots that land on the same pixel are drawn once.
export function layerSvg(map: SpotMap, layer: number): string {
  const paths: string[] = [];
  for (const category of CATEGORIES) {
    const seen = new Set<string>();
    const d: string[] = [];
    let i = 0;
    for (const [lat, lng] of map.points[category] ?? []) {
      if (lat < LAT_MIN || lat > LAT_MAX || lng < LNG_MIN || lng > LNG_MAX) continue;
      const [x, y] = project(lat, lng);
      const key = `${x} ${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (i++ % LAYERS === layer) d.push(`M${key}h0`);
    }
    if (d.length > 0) paths.push(`<path stroke="${CATEGORY_COLORS[category]}" d="${d.join("")}"/>`);
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">` +
    `<defs><filter id="g" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2" result="b"/>` +
    `<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` +
    `<g fill="none" stroke-width="4.5" stroke-linecap="round" filter="url(#g)">${paths.join("")}</g></svg>`
  );
}
