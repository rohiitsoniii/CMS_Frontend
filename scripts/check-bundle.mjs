/**
 * Bundle budget check — run after `vite build` via `npm run perf`.
 * Fails (exit 1) when gzipped dist assets exceed perf-budget.json.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'dist', 'assets');
const budget = JSON.parse(readFileSync(join(root, 'perf-budget.json'), 'utf8'));

const gzipKB = (file) => gzipSync(readFileSync(file)).length / 1024;

let js = 0;
let css = 0;
for (const name of readdirSync(assetsDir)) {
  const file = join(assetsDir, name);
  if (!statSync(file).isFile()) continue;
  if (name.endsWith('.js')) js += gzipKB(file);
  if (name.endsWith('.css')) css += gzipKB(file);
}

// First-visit JS: the entry script plus chunks index.html preloads
const html = readFileSync(join(root, 'dist', 'index.html'), 'utf8');
const initialFiles = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map((m) => m[1]);
const initialJs = initialFiles.reduce((n, f) => n + gzipKB(join(assetsDir, f)), 0);

console.log(`Initial JS gzip: ${initialJs.toFixed(1)} KB (budget ${budget.initialJsGzipKB} KB) — ${initialFiles.length} files`);
console.log(`JS gzip:  ${js.toFixed(1)} KB (budget ${budget.totalJsGzipKB} KB)`);
console.log(`CSS gzip: ${css.toFixed(1)} KB (budget ${budget.totalCssGzipKB} KB)`);

let failed = false;
if (js > budget.totalJsGzipKB) {
  console.error(`❌ JS bundle exceeds budget by ${(js - budget.totalJsGzipKB).toFixed(1)} KB`);
  failed = true;
}
if (budget.initialJsGzipKB && initialJs > budget.initialJsGzipKB) {
  console.error(`❌ Initial JS exceeds budget by ${(initialJs - budget.initialJsGzipKB).toFixed(1)} KB`);
  failed = true;
}
if (css > budget.totalCssGzipKB) {
  console.error(`❌ CSS bundle exceeds budget by ${(css - budget.totalCssGzipKB).toFixed(1)} KB`);
  failed = true;
}

if (!failed) console.log('✅ Bundle budgets pass');
process.exit(failed ? 1 : 0);
