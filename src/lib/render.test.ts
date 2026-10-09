import { expect, it, vi } from 'vitest';
import { canvasBlob, releaseCanvas, rasterSvg } from './render';
function canvasWith(blob: Blob | null) {
  const canvas = document.createElement('canvas');
  canvas.width = 144;
  canvas.height = 216;
  vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => callback(blob));
  return canvas;
}
it('reports native encoder failure instead of creating a broken download', async () => {
  await expect(canvasBlob(canvasWith(null), 'image/png')).rejects.toThrow(
    'cannot encode PNG',
  );
});
it('rejects browser PNG fallback when WebP was requested', async () => {
  await expect(
    canvasBlob(
      canvasWith(new Blob(['png'], { type: 'image/png' })),
      'image/webp',
    ),
  ).rejects.toThrow('cannot encode WEBP');
});
it('clears canvas backing dimensions after use', () => {
  const canvas = canvasWith(null);
  releaseCanvas(canvas);
  expect([canvas.width, canvas.height]).toEqual([0, 0]);
});
it('creates self-contained SVG with numeric dimensions and encoded PNG only', async () => {
  const svg = await rasterSvg(
    canvasWith(new Blob(['fixture bytes'], { type: 'image/png' })),
  );
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(svg);
  });
  const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
  expect(parsed.querySelector('parsererror')).toBeNull();
  expect(parsed.documentElement.getAttribute('viewBox')).toBe('0 0 144 216');
  expect(parsed.querySelector('image')?.getAttribute('href')).toMatch(
    /^data:image\/png;base64,/,
  );
  expect(parsed.querySelectorAll('script,foreignObject')).toHaveLength(0);
});
