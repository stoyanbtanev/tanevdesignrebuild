// Re-encode the 8 floating hero webps in /public to a web-friendly size.
// Run once:  node scripts/optimize-hero.mjs
import sharp from 'sharp';
import { readFile, writeFile, stat, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

const MAX_WIDTH = 1600;   // 2x of ~800px display max
const QUALITY = 72;

const files = ['1.webp','2.webp','3.webp','4.webp','5.webp','6.webp','7.webp','8.webp'];

for (const name of files) {
  const src = path.join(publicDir, name);
  const before = (await stat(src)).size;
  const buf = await readFile(src);
  const out = await sharp(buf)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();
  // Backup original once
  const bak = src + '.bak';
  try { await stat(bak); } catch { await rename(src, bak); }
  await writeFile(src, out);
  const after = out.length;
  const pct = (100 * (1 - after / before)).toFixed(1);
  console.log(`${name}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (-${pct}%)`);
}
