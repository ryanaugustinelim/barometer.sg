/**
 * screenshot.mjs
 * Usage: node screenshot.mjs <url> [label]
 * Saves to ./temporary screenshots/screenshot-N[-label].png
 */

import puppeteer from '/tmp/puppeteer-test/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT     = fileURLToPath(new URL('.', import.meta.url));
const SAVE_DIR = join(ROOT, 'temporary screenshots');
const CHROME   = '/Users/ryanaugustinelim/.cache/puppeteer/chrome/mac_arm-146.0.7680.76/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment screenshot number
async function nextIndex() {
  if (!existsSync(SAVE_DIR)) await mkdir(SAVE_DIR, { recursive: true });
  const files = await readdir(SAVE_DIR);
  const nums  = files
    .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0'))
    .filter(n => !isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

const idx      = await nextIndex();
const filename = label ? `screenshot-${idx}-${label}.png` : `screenshot-${idx}.png`;
const outPath  = join(SAVE_DIR, filename);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Brief pause for fonts/animations to settle
await new Promise(r => setTimeout(r, 800));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
