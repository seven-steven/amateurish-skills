import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.join(os.homedir(), '.config', 'skills', 'wxmp-cover');
const configFile = path.join(configDir, 'config.json');
const aliases = new Map(Object.entries({头条: 'lead', 次条: 'secondary', 两张: 'both', 单图: 'single'}));

function requireObject(value, field, allowedKeys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${field}: expected a JSON object`);
  if (allowedKeys) for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) throw new Error(`${field}: unknown field ${key} (allowed: ${allowedKeys.join(', ')})`);
  }
}

function readConfig() {
  try {
    const data = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    requireObject(data, 'config', ['mode', 'outputDir', 'theme', 'themes']);
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw new Error(`${configFile}: ${err.message}`);
  }
}

function localPath(value, base, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field}: expected a local path`);
  if (value === '~') return os.homedir();
  if (value.startsWith('~/')) return path.resolve(os.homedir(), value.slice(2));
  return path.resolve(base, value);
}

const assetDir = fileURLToPath(new URL('../assets/', import.meta.url));
const presets = {
  'jade-serif': { light: '#009C8D', base: '#002B25', ink: '#FFFFFF', bar: '#E03A00', fontWeight: 900, fontFiles: {900: path.join(assetDir, 'SourceHanSerifCN-Heavy.otf')} },
  'slate-sans': { light: '#45678F', base: '#14243B', ink: '#FFFFFF', bar: '#AD481E', fontWeight: 700, fontFiles: {700: path.join(assetDir, 'SourceHanSansCN-Bold.otf')} },
};

function resolveTheme(name, themes = {}) {
  requireObject(themes, 'themes');
  if (typeof name !== 'string' || !name.trim()) throw new Error('theme: expected a name');
  if (!Object.hasOwn(themes, name) && !Object.hasOwn(presets, name)) throw new Error(`unknown theme: ${name}`);
  const custom = Object.hasOwn(themes, name) ? themes[name] : {};
  requireObject(custom, `themes.${name}`, ['preset', 'light', 'base', 'ink', 'bar', 'fontWeight', 'fontFiles']);
  const preset = custom.preset ?? (Object.hasOwn(presets, name) ? name : 'jade-serif');
  if (!Object.hasOwn(presets, preset)) throw new Error(`unknown theme preset: ${preset}`);
  const style = { ...presets[preset], ...custom };
  for (const key of ['light', 'base', 'ink', 'bar']) {
    if (typeof style[key] !== 'string' || !/^#[0-9a-f]{6}$/i.test(style[key])) throw new Error(`${name}.${key}: expected #RRGGBB`);
  }
  requireObject(style.fontFiles, `${name}.fontFiles`);
  if (!Number.isInteger(style.fontWeight) || !Object.hasOwn(style.fontFiles, style.fontWeight)) throw new Error(`${name}: no font file for fontWeight ${style.fontWeight}`);
  return { ...style, fontFile: localPath(style.fontFiles[style.fontWeight], configDir, `${name}.fontFiles`) };
}

export function settings(args) {
  const config = readConfig();
  const raw = args.mode ?? config.mode ?? 'both';
  const mode = aliases.get(raw) ?? raw;
  if (!['lead', 'secondary', 'both', 'single'].includes(mode)) throw new Error(`mode: expected lead, secondary, both or single; got ${JSON.stringify(raw)}`);
  const root = args['output-dir'] !== undefined ? localPath(args['output-dir'], process.cwd(), '--output-dir')
    : config.outputDir !== undefined ? localPath(config.outputDir, configDir, 'outputDir') : path.join(os.tmpdir(), 'wxmp-cover');
  const theme = args.theme ?? config.theme ?? 'jade-serif';
  return { mode, root, theme, style: resolveTheme(theme, config.themes) };
}
