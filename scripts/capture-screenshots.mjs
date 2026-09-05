// scripts/capture-screenshots.mjs
// Captures high-DPR full-page PNG screenshots of remote sites and saves
// them to public/works/. Uses playwright-core driving the locally
// installed Google Chrome (or Microsoft Edge as a fallback).

import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public', 'works');
mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

// High-DPR (2x) full-page PNG captures.
const JOBS = [
  {
    name: 'la-roche-designs-1',
    url: 'https://la-roche-designs.vercel.app/',
    width: 1440,
    height: 900,
    dpr: 2,
  },
  {
    name: 'la-roche-designs-2',
    url: 'https://la-roche-designs.vercel.app/',
    width: 430,
    height: 932,
    dpr: 2,
    isMobile: true,
  },
  {
    name: 'afandie-pharm-1',
    url: 'https://afandiepharm.vercel.app/',
    width: 1440,
    height: 900,
    dpr: 2,
  },
  {
    name: 'afandie-pharm-2',
    url: 'https://afandiepharm.vercel.app/',
    width: 430,
    height: 932,
    dpr: 2,
    isMobile: true,
  },
  {
    name: 'ontario-pet-care-1',
    url: 'https://ontariopetcare.vercel.app/',
    width: 1440,
    height: 900,
    dpr: 2,
  },
  {
    name: 'ontario-pet-care-2',
    url: 'https://ontariopetcare.vercel.app/',
    width: 430,
    height: 932,
    dpr: 2,
    isMobile: true,
  },
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    try {
      if (existsSync(p)) return p;
    } catch {}
  }
  throw new Error('No Chrome or Edge installation found.');
}

async function capture(job, executablePath) {
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--font-render-hinting=none',
      '--enable-font-antialiasing',
      '--high-dpi-support=1',
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: job.dpr ?? 2,
      isMobile: !!job.isMobile,
      hasTouch: !!job.isMobile,
      userAgent: job.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    await page.goto(job.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForTimeout(4000);
    await page
      .evaluate(async () => {
        const step = 500;
        const max = document.body.scrollHeight;
        for (let y = 0; y <= max; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      })
      .catch(() => undefined);
    const png = await page.screenshot({
      fullPage: true,
      type: 'png',
      omitBackground: false,
      animations: 'disabled',
      caret: 'hide',
    });
    return png;
  } finally {
    await browser.close();
  }
}

async function main() {
  const executablePath = findChrome();
  console.log(`Using browser: ${executablePath}`);
  for (const job of JOBS) {
    const t0 = Date.now();
    try {
      console.log(`[${job.name}] capturing...`);
      const png = await capture(job, executablePath);
      const dest = resolve(OUT_DIR, `${job.name}.png`);
      writeFileSync(dest, png);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(
        `[OK] ${job.name} -> ${dest} | png=${(png.length / 1024).toFixed(0)}KB | ${elapsed}s`
      );
    } catch (err) {
      console.error(`[FAIL] ${job.name}: ${err.message}`);
    }
  }
  console.log('--- done ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
