import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const cli = fileURLToPath(new URL('../scripts/render.mjs', import.meta.url));
function environment(t, { standalone = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cover-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const tmp = path.join(dir, 'tmp');
  fs.mkdirSync(tmp);
  const env = { ...process.env, HOME: dir, TMPDIR: tmp };
  let command = cli;
  if (standalone) {
    const installed = path.join(dir, 'installed');
    for (const subdir of ['scripts', 'assets', 'vendor']) {
      fs.cpSync(new URL(`../${subdir}/`, import.meta.url), path.join(installed, subdir), { recursive: true });
    }
    command = path.join(installed, 'scripts/render.mjs');
    const guard = path.join(dir, 'offline.cjs');
    fs.writeFileSync(guard, "globalThis.fetch = () => { throw Error('unexpected network request'); };\n");
    env.NODE_OPTIONS = `--require="${guard}"`;
  }
  const run = (...args) => spawnSync(process.execPath, [command, ...args], { env, cwd: dir, encoding: 'utf8', timeout: 20000 });
  const render = (...args) => {
    const proc = run(...args);
    assert.equal(proc.status, 0, proc.error?.message ?? proc.stderr);
    return JSON.parse(proc.stdout);
  };
  const config = path.join(dir, '.config/skills/wxmp-cover/config.json');
  const configure = settings => {
    fs.mkdirSync(path.dirname(config), { recursive: true });
    fs.writeFileSync(config, JSON.stringify(settings));
  };
  return { dir, tmp, run, render, config, configure };
}

// Inspect exported PNGs (not renderer internals or an SVG-only mock).
function inkBox(png, match) {
  let left = png.width, top = png.height, right = -1, bottom = -1, count = 0;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const i = (y * png.width + x) * 4;
    if (!match(png.data[i], png.data[i+1], png.data[i+2])) continue;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y); count++;
  }
  return { left, top, right, bottom, count };
}
test('help describes the rendering entry point even before config is valid', t => {
  const { configure, run } = environment(t);
  configure({ mode: 'invalid' });
  const result = run('--help');
  assert.equal(result.status, 0, result.stderr);
  for (const word of ['--mode', '--lead', '--line', '--theme', '--output-dir']) assert.ok(result.stdout.includes(word));
});

test('configuration sets mode and outputDir; invocation overrides both for one run only', t => {
  const { dir, render, config, configure } = environment(t);
  configure({ mode: '单图', outputDir: '~/my covers' });
  const original = fs.readFileSync(config, 'utf8');
  const first = render(...titles), next = render(...titles);
  assert.deepEqual(first.files.map(f => f.layout), ['single']);
  assert.equal(path.dirname(path.dirname(first.files[0].png)), path.join(dir, 'my covers'));
  assert.notEqual(first.files[0].png, next.files[0].png);
  assert.ok(fs.existsSync(first.files[0].png));
  const override = render('--mode', '两张', '--output-dir', 'one off', ...titles);
  assert.deepEqual(override.files.map(f => f.layout), ['lead', 'secondary']);
  // The child can see a canonical cwd even when the temp directory uses a symlink (macOS /var).
  assert.equal(
    fs.realpathSync(path.dirname(path.dirname(override.files[0].png))),
    fs.realpathSync(path.join(dir, 'one off')),
  );
  assert.equal(fs.readFileSync(config, 'utf8'), original);
});

test('a named theme changes the actual PNG palette and selects a weighted font file', t => {
  const { render, configure } = environment(t);
  const palette = { light: '#172842', base: '#172842', ink: '#FFF1DB', bar: '#B54B31' };
  const sansPath = fileURLToPath(new URL('../assets/SourceHanSansCN-Bold.otf', import.meta.url));
  configure({mode: 'lead', theme: 'custom', themes: {
    custom: { ...palette, fontFiles: {'700': sansPath}, fontWeight: 700 },
    serif: palette,
  }});
  const [file] = render(...titles).files;
  const png = PNG.sync.read(fs.readFileSync(file.png));
  assert.deepEqual([...png.data.subarray(0, 4)], [23, 40, 66, 255]);
  const cream = (r,g,b) => r === 255 && g === 241 && b === 219;
  assert.ok(inkBox(png, cream).count > 1000);
  assert.ok(inkBox(png, (r,g,b) => r === 181 && g === 75 && b === 49).count > 500);
  const other = PNG.sync.read(fs.readFileSync(render('--theme', 'serif', ...titles).files[0].png));
  assert.notEqual(inkBox(png, cream).count, inkBox(other, cream).count, 'changing only the font must change the painted text');
  const slate = render('--theme', 'slate-sans', ...titles);
  assert.equal(slate.theme, 'slate-sans');
});

const white = (r, g, b) => Math.min(r, g, b) > 235;
const orange = (r, g, b) => r === 224 && g === 58 && b === 0;

test('bad settings and unavailable fonts give actionable errors, never a silent fallback', t => {
  const { configure, config, run, tmp } = environment(t);
  const font = fileURLToPath(new URL('../assets/SourceHanSerifCN-Heavy.otf', import.meta.url));
  for (const [theme, why] of [
    [{fontWeight: 700, fontFiles: {700: './missing.ttf'}}, /missing\.ttf/],
    [{fontWeight: 700, fontFiles: {700: font}}, /fontWeight.*700.*900/],
    [{ink: 'white'}, /ink.*RRGGBB/],
    [{fontFile: 'misspelled.otf'}, /fontFile/],
    [{fontFiles: null}, /fontFiles/],
  ]) {
    configure({theme: 'brand', themes: {brand: theme}});
    const result = run(...titles);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, why);
  }
  fs.writeFileSync(config, '{');
  const invalid = run(...titles);
  assert.notEqual(invalid.status, 0);
  assert.ok(invalid.stderr.includes(config));
  assert.deepEqual(fs.readdirSync(tmp), []);
});

test('invalid copy is rejected with a remedy before emitting even a partial pair', t => {
  const { run, tmp } = environment(t);
  for (const [args, why] of [
    [['--lead', '项目复盘', '--line', '三天', '--line', '🦄'], /字形.*U\+1F984/u],
    [['--mode', 'single', '--line', '只有一行'], /两行/],
    [['--mode', 'secondary', '--line', '三天', '--line', '体验营', '--line', '多余'], /两行/],
    [['--mode', 'lead', '--lead', '项目\n复盘'], /换行/],
    [['--mode', 'lead', '--lead', '实际上这个句子长到不适合作为封面标题了'], /精简/],
    [['--mode', 'lead', '--lead', ' '], /空/],
    [['--mode', '../other', ...titles], /mode/],
  ]) {
    const result = run(...args);
    assert.notEqual(result.status, 0, JSON.stringify(args));
    assert.match(result.stderr, why);
    assert.equal(result.stdout, '');
  }
  assert.deepEqual(fs.readdirSync(tmp), []);
});

test('headlines render as a local SVG and a 940 × 400 PNG with centered ink over an accent', t => {
  const { render, tmp } = environment(t);
  const { files } = render('--mode', '头条', '--lead', 'FDE交付');
  assert.deepEqual(files.map(f => f.layout), ['lead']);
  const [f] = files;
  assert.equal(path.dirname(path.dirname(f.png)), path.join(tmp, 'wxmp-cover'));
  assert.match(fs.readFileSync(f.svg, 'utf8'), /<svg\b/);
  const png = PNG.sync.read(fs.readFileSync(f.png));
  assert.deepEqual([png.width, png.height], [940, 400]);
  const ink = inkBox(png, white), bar = inkBox(png, orange);
  assert.ok(ink.count > 1000 && bar.count > 500);
  assert.ok(ink.left > 210 && ink.right < 730 && ink.bottom - ink.top >= 84);
  assert.ok(Math.abs((ink.left + ink.right) / 2 - 470) <= 2);
  assert.ok(ink.top < bar.top && bar.top < ink.bottom && ink.bottom < bar.bottom);
});

const titles = ['--lead', 'FDE交付', '--line', 'FDE', '--line', '交付'];
test('a standalone offline installation preserves the published PNGs from 66613b4', t => {
  const { render } = environment(t, { standalone: true });
  const files = [...render('--mode', 'both', ...titles).files, ...render('--mode', 'single', ...titles).files];
  const hashes = Object.fromEntries(files.map(f => [f.layout, createHash('sha256').update(fs.readFileSync(f.png)).digest('hex')]));
  assert.deepEqual(hashes, {
    lead: 'c0b54e3ec54bf6c19384b9d2352a17513b512df1a56b9616909485f98faf464a',
    secondary: '01dbaed6a0be6c1e037bd9e9693105d3a338ae24c5b552151a0aa75561134f79',
    single: 'f9bacd58ef9c67494963655b6f8eb6466122cdede6b6a1b182bad0a9789f6a6f',
  });
});
test('single keeps both lines and the accent intact when center-cropped from 940 to 400', t => {
  const { render } = environment(t);
  const { files } = render('--mode', '单图', ...titles.slice(2));
  assert.deepEqual(files.map(f => f.layout), ['single']);
  const png = PNG.sync.read(fs.readFileSync(files[0].png));
  assert.deepEqual([png.width, png.height], [940, 400]);
  const [square] = render('--mode', 'secondary', ...titles.slice(2)).files;
  const crop = PNG.sync.read(fs.readFileSync(square.png));
  for (const match of [white, orange]) {
    const a = inkBox(png, match), b = inkBox(crop, match);
    assert.ok(a.count > 100);
    assert.deepEqual({...a, left: a.left - 270, right: a.right - 270}, b);
  }
});
test('the default pair and a standalone secondary use the same balanced two-line square', t => {
  const { render } = environment(t);
  const pair = render(...titles).files;
  assert.deepEqual(pair.map(f => f.layout), ['lead', 'secondary']);
  const [square] = render('--mode', '次条', ...titles.slice(2)).files;
  const bytes = fs.readFileSync(square.png);
  assert.deepEqual(bytes, fs.readFileSync(pair[1].png));
  const png = PNG.sync.read(bytes);
  assert.deepEqual([png.width, png.height], [400, 400]);
  const ink = inkBox(png, white), bar = inkBox(png, orange);
  assert.ok(ink.left >= 32 && ink.right < 368 && ink.top >= 75 && ink.bottom < 325);
  assert.ok(ink.top < bar.top && bar.bottom < ink.bottom - 68);
  // A clear (ink-free) gap separates the two lines below the first-line accent.
  const at = y => png.data.subarray(y * 1600, (y+1) * 1600).filter((r,i,row) => i%4 === 0 && white(r,row[i+1],row[i+2])).length;
  assert.equal(at(bar.bottom + 6), 0);
  assert.ok(Array.from({length: 100}, (_,i) => at(bar.bottom+20+i)).some(n => n > 10));
});
