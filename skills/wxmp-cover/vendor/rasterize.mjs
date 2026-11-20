// Maintained in tools/wxmp-graphics. Build copies this file beside its pinned JS glue and WASM.
import { readFileSync } from 'node:fs';
import { initWasm, Resvg } from './resvg.mjs';

let ready;

// Both callers supply self-contained SVG. Optional synchronous checks let the caller
// enforce its layout policy without owning WASM handles or reading unnecessary pixels.
export async function svgToPng(svg, { renderOptions, checkBounds, checkPixels } = {}) {
  await (ready ??= initWasm(readFileSync(new URL('./resvg.wasm', import.meta.url))));
  const renderer = new Resvg(svg, renderOptions);
  let image;
  try {
    if (renderer.imagesToResolve().length) throw new Error('external image resources are unsupported');
    if (checkBounds) {
      const box = renderer.innerBBox();
      try {
        checkBounds(box && { x: box.x, y: box.y, width: box.width, height: box.height });
      } finally { box?.free(); }
    }
    image = renderer.render();
    if (checkPixels) checkPixels(image.pixels);
    return image.asPng();
  } finally {
    image?.free();
    renderer.free();
  }
}
