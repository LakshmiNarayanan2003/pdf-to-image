import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {},
);
const page = await browser.newPage({
  viewport: { width: 1440, height: 1040 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
await mkdir('docs/images', { recursive: true });
await page.goto(
  `http://127.0.0.1:4173${process.env.VITE_BASE_PATH || '/pdf-to-image/'}`,
);
await page.screenshot({ path: 'docs/images/desktop.png', fullPage: true });
await page.getByRole('button', { name: 'Try sample PDF' }).click();
await page.getByAltText('Preview of page 1', { exact: true }).waitFor();
await page.screenshot({ path: 'docs/images/workspace.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'docs/images/mobile.png', fullPage: true });
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  `<html><body style="margin:0;background:#edf4ed;color:#273c33;font-family:Arial,sans-serif"><main style="padding:78px"><div style="font-weight:700;font-size:27px;letter-spacing:-1px">PDF2Pix <span style="font-size:13px;letter-spacing:2px;margin-left:18px;color:#285f49">FREE & OPEN SOURCE</span></div><h1 style="font-size:78px;letter-spacing:-4px;font-weight:500;margin:70px 0 22px">Convert PDFs.<br><em style="font-family:Georgia;color:#285f49">Keep them private.</em></h1><p style="font-size:23px;color:#59695f">Beautiful images. Zero uploads. Right in your browser.</p><div style="margin-top:40px;color:#285f49;font-size:16px">PNG · JPG · WebP · SVG (embedded raster)</div></main></body></html>`,
);
await page.screenshot({ path: 'public/social-preview.png' });
await browser.close();
console.log(
  'Captured real app screenshots and generated original social card.',
);
