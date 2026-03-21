/**
 * screenshot-viewport.mjs — takes a viewport-only screenshot (above the fold)
 */
import puppeteer from '/tmp/puppeteer-test/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT     = fileURLToPath(new URL('.', import.meta.url));
const SAVE_DIR = join(ROOT, 'temporary screenshots');
const CHROME   = '/Users/ryanaugustinelim/.cache/puppeteer/chrome/mac_arm-146.0.7680.76/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const url     = process.argv[2] || 'http://localhost:3000';
const label   = process.argv[3] || 'viewport';
const scrollY = parseInt(process.argv[4] || '0');
const mobile  = process.argv[5] === 'mobile';
const vpW     = mobile ? 390  : 1440;
const vpH     = mobile ? 844  : 900;

if (!existsSync(SAVE_DIR)) await mkdir(SAVE_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: vpW, height: vpH, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
if (scrollY) await page.evaluate(y => window.scrollTo(0, y), scrollY);
await new Promise(r => setTimeout(r, 800));

const outPath = join(SAVE_DIR, `shot-${label}.png`);
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();
console.log(`Saved: ${outPath}`);
