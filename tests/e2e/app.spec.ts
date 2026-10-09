import { test, expect, type Page, type Download } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import JSZip from 'jszip';
import { PNG } from 'pngjs';
import { readFile, open } from 'node:fs/promises';
import path from 'node:path';
const fixture = (name: string) => path.resolve('tests/fixtures', `${name}.pdf`);
async function upload(page: Page, files: string | string[]) {
  await page.getByLabel('PDF file picker').setInputFiles(files);
  await expect(
    page.getByRole('button', { name: /Export image/ }),
  ).toBeEnabled();
}
async function sample(page: Page) {
  await page.getByRole('button', { name: 'Try sample PDF' }).click();
  await expect(page.getByText('3 pages ·', { exact: false })).toBeVisible();
  await expect(
    page.getByAltText('Preview of page 1', { exact: true }),
  ).toBeVisible();
}
async function bytes(download: Download) {
  const p = await download.path();
  expect(p).toBeTruthy();
  return readFile(p!);
}
async function exportFile(page: Page) {
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export image/ }).click();
  const download = await event;
  await expect(page.getByText(/Your download is ready/)).toBeVisible();
  return { name: download.suggestedFilename(), data: await bytes(download) };
}
async function dimensions(page: Page, data: Buffer, mime: string) {
  return page.evaluate(
    async ({ base64, mime }) => {
      const image = new Image();
      image.src = `data:${mime};base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      return {
        width: image.width,
        height: image.height,
        corner: Array.from(ctx.getImageData(0, 0, 1, 1).data),
      };
    },
    { base64: data.toString('base64'), mime },
  );
}
test.beforeEach(async ({ page }) => {
  await page.goto('./');
});
test('sample: all pages are distinct PNGs with exact DPI dimensions in ZIP', async ({
  page,
}) => {
  await sample(page);
  await page.getByLabel('Resolution').selectOption('72');
  const out = await exportFile(page);
  expect(out.name).toBe('pdf2pix-images.zip');
  const zip = await JSZip.loadAsync(out.data);
  expect(Object.keys(zip.files)).toEqual([
    'PDF2Pix-sample-page-001.png',
    'PDF2Pix-sample-page-002.png',
    'PDF2Pix-sample-page-003.png',
  ]);
  const images = await Promise.all(
    Object.values(zip.files).map((f) => f.async('nodebuffer')),
  );
  for (let i = 0; i < 3; i++) {
    const png = PNG.sync.read(images[i]);
    expect([png.width, png.height]).toEqual(i === 2 ? [792, 612] : [612, 792]);
    expect(images[i].length).toBeGreaterThan(10000);
  }
  expect(images[0].equals(images[1])).toBe(false);
  expect(images[1].equals(images[2])).toBe(false);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(
    page.getByAltText('Preview of page 2', { exact: true }),
  ).toBeVisible();
});
for (const [format, mime, ext] of [
  ['JPG', 'image/jpeg', 'jpg'],
  ['WebP', 'image/webp', 'webp'],
  ['SVG', 'image/svg+xml', 'svg'],
] as const)
  test(`sample exports real ${format} output`, async ({ page }) => {
    await sample(page);
    const button = page.getByRole('button', { name: new RegExp(`^${format}`) });
    if (format === 'WebP' && (await button.isDisabled())) {
      await expect(
        page.getByText('WebP encoding is unavailable in this browser.', {
          exact: true,
        }),
      ).toBeVisible();
      return;
    }
    await button.click();
    await page.getByLabel('Resolution').selectOption('72');
    await page.getByLabel('Pages to export').selectOption('current');
    const out = await exportFile(page);
    expect(out.name).toBe(`PDF2Pix-sample-page-001.${ext}`);
    if (format === 'SVG') {
      const svg = out.data.toString();
      expect(svg).toContain('data:image/png;base64,');
      expect(svg).not.toMatch(/<script|onload=|https?:\/\/(?!www.w3.org)/);
      const info = await page.evaluate((s) => {
        const d = new DOMParser().parseFromString(s, 'image/svg+xml');
        return {
          errors: d.querySelectorAll('parsererror').length,
          width: d.documentElement.getAttribute('width'),
          image: d.querySelectorAll('image').length,
        };
      }, svg);
      expect(info).toEqual({ errors: 0, width: '612', image: 1 });
    } else {
      expect((await dimensions(page, out.data, mime)).width).toBe(612);
      if (format === 'JPG')
        expect(out.data.subarray(0, 3).toString('hex')).toBe('ffd8ff');
      else {
        expect(out.data.subarray(0, 4).toString()).toBe('RIFF');
        expect(out.data.subarray(8, 12).toString()).toBe('WEBP');
      }
    }
  });
test('DPI, transparent PNG and white JPEG background with quality', async ({
  page,
}) => {
  await upload(page, fixture('transparent'));
  await page.getByLabel('Custom DPI').fill('144');
  let out = await exportFile(page);
  let info = await dimensions(page, out.data, 'image/png');
  expect(info).toEqual({ width: 288, height: 432, corner: [0, 0, 0, 0] });
  await page.getByRole('button', { name: /^JPG/ }).click();
  await page.getByLabel('Quality').fill('20');
  out = await exportFile(page);
  info = await dimensions(page, out.data, 'image/jpeg');
  expect(info.corner[3]).toBe(255);
  for (const channel of info.corner.slice(0, 3))
    expect(channel).toBeGreaterThanOrEqual(250);
  const low = out.data.length;
  await page.getByLabel('Quality').fill('100');
  out = await exportFile(page);
  expect(out.data.length).toBeGreaterThan(low);
});
test('ranges and batch naming, selection, invalid ranges and recovery', async ({
  page,
}) => {
  await upload(page, [fixture('mixed'), fixture('mixed')]);
  await page.getByLabel('Resolution').selectOption('72');
  await page.getByLabel('Pages to export').selectOption('custom');
  await page.getByLabel('Page range', { exact: true }).fill('1,3');
  const out = await exportFile(page);
  const zip = await JSZip.loadAsync(out.data);
  expect(Object.keys(zip.files)).toEqual([
    'mixed-page-001.png',
    'mixed-page-003.png',
    'mixed-2-page-001.png',
    'mixed-2-page-003.png',
  ]);
  await page.getByLabel('Page range', { exact: true }).fill('1-99');
  await page.getByRole('button', { name: /Export image/ }).click();
  await expect(page.getByRole('alert')).toContainText('between 1 and 3');
  await page.getByLabel('Page range', { exact: true }).fill('2');
  await page.getByRole('checkbox').last().uncheck();
  const single = await exportFile(page);
  expect(single.name).toBe('mixed-page-002.png');
  await page.getByRole('button', { name: 'Clear all files' }).click();
  await expect(
    page.getByRole('button', { name: 'Choose PDF files', exact: true }),
  ).toBeVisible();
});
for (const [name, size] of [
  ['rotated', [216, 144]],
  ['crop', [100, 150]],
  ['raster', [144, 216]],
  ['vector', [144, 216]],
] as const)
  test(`${name} PDF renders with correct page dimensions`, async ({ page }) => {
    await upload(page, fixture(name));
    await page.getByLabel('Resolution').selectOption('72');
    const out = await exportFile(page);
    const png = PNG.sync.read(out.data);
    expect([png.width, png.height]).toEqual(size);
    expect(new Set(png.data).size).toBeGreaterThan(3);
  });
test('invalid/empty/corrupt files report errors and valid files recover', async ({
  page,
}) => {
  for (const name of ['renamed', 'empty', 'corrupt']) {
    await page.getByLabel('PDF file picker').setInputFiles(fixture(name));
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Choose PDF files', exact: true }),
    ).toBeEnabled();
  }
  await upload(page, [fixture('renamed'), fixture('text')]);
  await expect(page.getByRole('alert')).toContainText('signature');
  const out = await exportFile(page);
  expect(out.name).toBe('text-page-001.png');
});
test('extracts TXT and JSON without OCR or HTML execution', async ({
  page,
}) => {
  await upload(page, fixture('sentinel'));
  await page.getByLabel('More formats & text extraction').selectOption('txt');
  const txt = await exportFile(page);
  expect(txt.data.toString()).toContain('PRIVATE-SENTINEL-7c924b');
  await page.getByLabel('More formats & text extraction').selectOption('json');
  const json = await exportFile(page);
  const parsed = JSON.parse(json.data.toString());
  expect(parsed.page).toBe(1);
  expect(parsed.items[0].text).toBe('PRIVATE-SENTINEL-7c924b');
});
test('cancel stops export and permits subsequent conversion', async ({
  page,
}) => {
  await sample(page);
  await page.getByLabel('Resolution').selectOption('300');
  await page.getByRole('button', { name: /Export image/ }).click();
  await page.getByRole('button', { name: 'Cancel processing' }).click();
  await expect(
    page.getByText('Export cancelled. Your PDFs are ready to try again.'),
  ).toBeVisible();
  await page.getByLabel('Resolution').selectOption('72');
  await exportFile(page);
});
test('privacy: document sentinels stay local; only static same-origin GETs', async ({
  page,
}) => {
  const requests: { url: string; method: string; body: string }[] = [];
  const errors: string[] = [];
  page.context().on('request', (r) =>
    requests.push({
      url: r.url(),
      method: r.method(),
      body: r.postData() ?? '',
    }),
  );
  page.on('pageerror', (e) => errors.push(e.message));
  await page.evaluate(() => {
    (window as unknown as { cspViolations: string[] }).cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(
        e.violatedDirective,
      );
    });
  });
  await upload(page, fixture('sentinel'));
  await exportFile(page);
  expect(
    requests
      .filter((r) => !r.url.startsWith('blob:'))
      .every(
        (r) =>
          r.method === 'GET' &&
          !r.body &&
          new URL(r.url).origin === 'http://127.0.0.1:4173' &&
          /\/(favicon\.svg|assets\/[^/]+|pdfjs\/(standard_fonts|cmaps|wasm)\/[^/]+)$/.test(
            new URL(r.url).pathname,
          ),
      ),
  ).toBe(true);
  expect(JSON.stringify(requests)).not.toMatch(
    /sentinel|PRIVATE-SENTINEL|upload|analytics|telemetry/i,
  );
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => (window as unknown as { cspViolations: string[] }).cspViolations,
    ),
  ).toEqual([]);
  expect(
    await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      databases: (await indexedDB.databases()).length,
      workers: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ local: 0, session: 0, databases: 0, workers: 0 });
});
test('drop, replace and remove work, and object URLs are revoked', async ({
  page,
}) => {
  await page.evaluate(() => {
    const original = URL.revokeObjectURL;
    (window as unknown as { revocations: number }).revocations = 0;
    URL.revokeObjectURL = (url) => {
      (window as unknown as { revocations: number }).revocations++;
      original(url);
    };
  });
  const data = await readFile(fixture('text'));
  const transfer = await page.evaluateHandle((base64) => {
    const dt = new DataTransfer();
    dt.items.add(
      new File(
        [Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))],
        'dropped.pdf',
        { type: 'application/pdf' },
      ),
    );
    return dt;
  }, data.toString('base64'));
  await page
    .locator('.dropzone')
    .dispatchEvent('drop', { dataTransfer: transfer });
  await expect(page.getByText('dropped.pdf', { exact: true })).toBeVisible();
  await expect(
    page.getByAltText('Preview of page 1', { exact: true }),
  ).toBeVisible();
  await exportFile(page);
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Replace PDF' }).click();
  await (await chooser).setFiles(fixture('vector'));
  await expect(page.getByText('vector.pdf', { exact: true })).toBeVisible();
  await expect(page.getByText('dropped.pdf', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Remove vector.pdf' }).click();
  await expect(
    page.getByRole('button', { name: 'Choose PDF files', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { revocations: number }).revocations,
    ),
  ).toBeGreaterThan(0);
});
test('keyboard, themes, mobile layout and accessibility', async ({
  page,
}, testInfo) => {
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to converter' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await sample(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath('desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath('mobile.png'),
    fullPage: true,
  });
});
test('sample appearance is stable at fixed viewport', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Visual baseline uses one deterministic rendering engine; output assertions run in all engines.',
  );
  await sample(page);
  await expect(
    page.getByAltText('Preview of page 1', { exact: true }),
  ).toHaveScreenshot('sample-page-1.png', { maxDiffPixelRatio: 0.01 });
});

test('encrypted PDF prompts locally, rejects wrong password, unlocks and cancels', async ({
  page,
}) => {
  await page.getByLabel('PDF file picker').setInputFiles(fixture('encrypted'));
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('PDF password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Unlock PDF', exact: true }).click();
  await expect(
    page.getByText('That password did not work. Try again.'),
  ).toBeVisible();
  await page
    .getByLabel('PDF password', { exact: true })
    .fill('local-test-password');
  await page.getByRole('button', { name: 'Unlock PDF', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Export image/ }),
  ).toBeEnabled();
  await exportFile(page);
  await page.getByRole('button', { name: 'Clear all files' }).click();
  await page.getByLabel('PDF file picker').setInputFiles(fixture('encrypted'));
  await page.getByRole('button', { name: 'Cancel opening' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Choose PDF files', exact: true }),
  ).toBeEnabled();
  await upload(page, fixture('text'));
});
test('safe limits reject oversized input and canvas requests without losing documents', async ({
  page,
}, testInfo) => {
  const huge = testInfo.outputPath('huge.pdf');
  const handle = await open(huge, 'w');
  await handle.truncate(100 * 1024 * 1024 + 1);
  await handle.close();
  await page.getByLabel('PDF file picker').setInputFiles(huge);
  await expect(page.getByRole('alert')).toContainText('100 MB');
  await sample(page);
  await page.getByLabel('Custom DPI').fill('600');
  await page.getByRole('button', { name: /Export image/ }).click();
  await expect(page.getByRole('alert')).toContainText('too large at this DPI');
  await page.getByLabel('Custom DPI').fill('35');
  await page.getByRole('button', { name: /Export image/ }).click();
  await expect(page.getByRole('alert')).toContainText('between 36 and 600');
  await page.getByLabel('Resolution').selectOption('72');
  await exportFile(page);
});
