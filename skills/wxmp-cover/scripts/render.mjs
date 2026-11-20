import fs from 'node:fs';
import { settings } from './settings.mjs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import opentype from '../vendor/opentype.cjs';
import { svgToPng } from '../vendor/rasterize.mjs';
import { coverSvg } from './layout.mjs';

function loadFont({fontFile, fontWeight}) {
  try {
    const bytes = fs.readFileSync(fontFile);
    const font = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {lowMemory: true});
    if (font.tables.fvar) throw new Error('请选择指定字重的静态 TTF/OTF，不支持可变字体');
    const actual = font.tables.os2?.usWeightClass;
    if (actual !== fontWeight) throw new Error(`fontWeight 配置为 ${fontWeight}，文件字重为 ${actual ?? '未知'}`);
    return font;
  } catch (err) { throw new Error(`不能使用字体 ${fontFile}: ${err.message}`); }
}

async function main() {
  const { values } = parseArgs({ options: {
    mode: { type: 'string' }, theme: { type: 'string' }, 'output-dir': { type: 'string' },
    lead: { type: 'string' }, line: { type: 'string', multiple: true }, help: { type: 'boolean', short: 'h' },
  } });
  if (values.help) {
    console.log(`node render.mjs [--mode lead|secondary|both|single] [--theme NAME] [--output-dir DIR]
  --lead 'FDE交付'               头条一行；lead、both 需要
  --line 'FDE' --line '交付'     次条/单图两行；secondary、single、both 需要
模式也支持：头条、次条、两张、单图。调用参数 > config.json > 内置默认。
成功时输出 JSON，其中 files 列出本次 SVG、PNG 的绝对路径。`);
    return;
  }
  const { mode, root, theme, style } = settings(values);
  const layouts = mode === 'both' ? ['lead', 'secondary'] : [mode];
  const font = loadFont(style);
  const images = [];
  for (const layout of layouts) {
    const lines = layout === 'lead' ? [values.lead] : values.line;
    const svg = coverSvg(font, layout, lines, style);
    images.push({ layout, lines, svg, png: await svgToPng(svg) });
  }
  fs.mkdirSync(root, {recursive: true});
  const dir = fs.mkdtempSync(path.join(root, 'run-'));
  const files = images.map(image => {
    const { layout, lines } = image;
    const png = path.join(dir, `${layout}.png`), svg = path.join(dir, `${layout}.svg`);
    fs.writeFileSync(svg, image.svg);
    fs.writeFileSync(png, image.png);
    return { layout, lines, png, svg };
  });
  console.log(JSON.stringify({ mode, theme, fontFile: style.fontFile, fontWeight: style.fontWeight, files }));
}

main().catch(err => { console.error(`wxmp-cover: ${err.message}`); process.exitCode = 1; });
