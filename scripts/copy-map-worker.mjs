// MapLibre runs its tile parsing in a Web Worker that it loads from a file next to its own module. The bundler
// does not copy that file, so it is put in public/ before every build and the map is pointed at it.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/vendor", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/vendor/maplibre-gl-worker.mjs");
