// scripts/capture-screenshots.mjs
// Captures full-page screenshots of remote sites and embeds them into SVG wrappers.
// Uses playwright-core driving the locally installed Google Chrome.

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

const JOBS = [
  {
    name: 'la-roche-designs-1',
    url: 'https://la-roche-designs.vercel.app/',
    width: 1440,
    height: 900,
    label: 'La Roche Designs desktop preview',
  },
  {
    name: 'la-roche-designs-2',
    url: 'https://la-roche-designs.vercel.app/',
    width: 375,
    height: 812,
    label: 'La Roche Designs mobile preview',
  },
  {
    name: 'afandie-pharm-1',
    url: 'https://afandiepharm.vercel.app/',
    width: 1440,
    height: 900,
    label: 'Afandie Pharmacy desktop preview',
  },
  {
    name: 'afandie-pharm-2',
    url: 'https://afandiepharm.vercel.app/',
    width: 375,
    height: 812,
    label: 'Afandie Pharmacy mobile preview',
  },
  {
    name: 'ontario-pet-care-1',
    url: 'https://ontariopetcare.vercel.app/',
    width: 1440,
    height: 900,
    label: 'Ontario Pet Care desktop preview',
  },
  {
    name: 'ontario-pet-care-2',
    url: 'https://ontariopetcare.vercel.app/',
    width: 375,
    height: 812,
    label: 'Ontario Pet Care mobile preview',
  },
];

function escapeXml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

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
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: 1,
      userAgent:
        job.width >= 1000
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
          : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const page = await context.newPage();
    await page.goto(job.url, { waitUntil: 'networkidle', timeout: 60_000 });
    // Wait a bit longer for animations / fonts to settle.
    await page.waitForTimeout(2500);
    // Best-effort: trigger any lazy images.
    await page
      .evaluate(async () => {
        await new Promise((r) => setTimeout(r, 250));
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 600));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      })
      .catch(() => {});

    const png = await page.screenshot({ fullPage: true, type: 'png' });

    // Measure real page dimensions
    const dims = await page.evaluate(() => ({
      w: document.documentElement.scrollWidth,
      h: document.documentElement.scrollHeight,
    }));

    return { png, dims };
  } finally {
    await browser.close();
  }
}

function toSvg({ png, dims }, job) {
  const b64 = Buffer.from(png).toString('base64');
  const width = Math.max(dims.w || job.width, job.width);
  const height = Math.max(dims.h || job.height, job.height);
  const label = escapeXml(job.label);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
  <defs>
    <clipPath id="frame">
      <rect width="${width}" height="${height}" rx="0" ry="0"/>
    </clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <image x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${b64}"/>
  </g>
</svg>
`;
}

async function main() {
  const executablePath = findChrome();
  console.log(`Using browser: ${executablePath}`);
  const results = [];
  for (const job of JOBS) {
    const t0 = Date.now();
    try {
      const out = await capture(job, executablePath);
      const svg = toSvg(out, job);
      const dest = resolve(OUT_DIR, `${job.name}.svg`);
      writeFileSync(dest, svg, 'utf8');
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(
        `[OK] ${job.name} (${job.width}x${job.height}) -> ${dest} | page=${out.dims.w}x${out.dims.h} | svg=${(svg.length / 1024).toFixed(0)}KB | ${elapsed}s`
      );
      results.push({ name: job.name, ok: true, dest, pageSize: out.dims });
    } catch (err) {
      console.error(`[FAIL] ${job.name}: ${err.message}`);
      results.push({ name: job.name, ok: false, error: err.message });
    }
  }
  console.log('--- summary ---');
  for (const r of results) console.log(JSON.stringify(r));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});