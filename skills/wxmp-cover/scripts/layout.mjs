// Work with visible outlines, not em boxes, so changing a font keeps the ink centered.
function outline(font, line) {
  if (typeof line !== 'string' || !line.trim()) throw new Error('封面短标题不能为空');
  if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(line)) throw new Error('每段短词内不能有换行或控制符；两行请分传 --line');
  if (line.length > 128) throw new Error('请精简封面短词');
  for (const char of line) {
    if (!font.charToGlyphIndex(char)) throw new Error(`字体缺少字形 ${char} (U+${char.codePointAt(0).toString(16).toUpperCase()})，请换字体或短词`);
  }
  const path = font.getPath(line, 0, 0, 1000);
  const { x1, y1, x2, y2 } = path.getBoundingBox();
  return { d: path.toPathData(2), x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function mix(light, base, t) {
  const n = (hex, i) => parseInt(hex.slice(i, i + 2), 16);
  return '#' + [1, 3, 5].map(i => Math.round(n(light, i) * (1-t) + n(base, i) * t).toString(16).padStart(2, '0')).join('');
}

export function coverSvg(font, layout, lines, colors) {
  const stacked = layout !== 'lead';
  const artWidth = stacked ? 400 : 940; // single extends only the background beyond the square artboard
  const W = layout === 'secondary' ? 400 : 940, H = 400;
  if (stacked && lines?.length !== 2) throw new Error(`${layout} 需要两行短词，各传一次 --line`);
  const shapes = lines.map(line => outline(font, line));
  const maxWidth = Math.max(...shapes.map(p => p.w));
  const sumHeight = shapes.reduce((sum, p) => sum + p.h, 0);
  const gap = stacked ? 28 : 0;
  const size = Math.floor(1000 * Math.min((stacked ? .84 : .52)*artWidth/maxWidth, ((stacked ? .62 : .29)*H-gap)/sumHeight));
  const scale = size / 1000;
  if (!Number.isFinite(scale) || shapes.some(p => p.h * scale < (stacked ? 68 : 84))) {
    throw new Error(`${layout} 缩略图中字高不足，请精简封面短词${stacked ? '或调整断行' : ''}`);
  }
  const barW = Math.round((stacked ? .66 : .49)*artWidth), barH = stacked ? 30 : 44;
  const barTop = shapes[0].h * scale - Math.round(.72 * barH);
  const top = Math.floor((H - Math.max(sumHeight*scale + gap, barTop + barH)) / 2);
  let y = top;
  const letters = shapes.map(p => {
    const x = (W-p.w*scale)/2 - p.x*scale;
    const svg = `<path fill="${colors.ink}" transform="translate(${x} ${y-p.y*scale}) scale(${scale})" d="${p.d}"/>`;
    y += p.h*scale + gap;
    return svg;
  }).join('\n');
  const stops = [0, .25, .5, .75, 1].map(d => `<stop offset="${d}" stop-color="${mix(colors.light, colors.base, d*d*(3-2*d))}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="spot" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${W*.5} ${H*.12}) scale(${artWidth*.58} ${H*1.02})">${stops}</radialGradient></defs>
<rect width="100%" height="100%" fill="url(#spot)"/>
<rect x="${Math.floor((W-barW)/2)}" y="${top+barTop}" width="${barW}" height="${barH}" fill="${colors.bar}"/>
${letters}
</svg>`;
}
