import { LAYERS, layerSvg } from "@/lib/map-dots";
import { getSpotMap } from "@/lib/spot-map";

// /map/0.svg .. /map/2.svg: the home page map's dot layers. The page adds ?v=<spot count>, so a new
// nightly sync gets a new URL while the browser keeps the old one for its hour.
export async function GET(_req: Request, ctx: RouteContext<"/map/[layer]">) {
  const { layer } = await ctx.params;
  const m = /^([0-9])\.svg$/.exec(layer);
  const n = m ? Number(m[1]) : -1;
  if (n < 0 || n >= LAYERS) return new Response(null, { status: 404 });
  const map = await getSpotMap();
  if (!map) return new Response(null, { status: 503 });
  return new Response(layerSvg(map, n), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
