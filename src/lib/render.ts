import type { PDFDocumentProxy } from 'pdfjs-dist';
import { abortCheck, dimensions, UserError } from './utils';
export async function renderPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  dpi: number,
  signal: AbortSignal,
  white = false,
): Promise<HTMLCanvasElement> {
  abortCheck(signal);
  const page = await pdf.getPage(pageNumber);
  abortCheck(signal);
  const original = page.getViewport({ scale: 1 });
  let size;
  try {
    size = dimensions(original.width, original.height, dpi);
  } catch (error) {
    throw new UserError((error as Error).message);
  }
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new UserError(
      'Your browser could not create a canvas. Close other tabs and try again.',
    );
  const task = page.render({
    canvas,
    canvasContext: context,
    viewport: page.getViewport({ scale: dpi / 72 }),
    background: white ? '#ffffff' : 'rgba(0,0,0,0)',
  });
  const cancel = () => task.cancel();
  signal.addEventListener('abort', cancel, { once: true });
  try {
    await task.promise;
    abortCheck(signal);
    return canvas;
  } catch (error) {
    releaseCanvas(canvas);
    throw error;
  } finally {
    signal.removeEventListener('abort', cancel);
    page.cleanup();
  }
}
export function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}
export function canvasBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== mime)
          reject(
            new UserError(
              `Your browser cannot encode ${mime.replace('image/', '').toUpperCase()}. Choose PNG or JPEG.`,
            ),
          );
        else resolve(blob);
      },
      mime,
      quality,
    );
  });
}
export async function detectCodecs(): Promise<{
  webp: boolean;
  avif: boolean;
}> {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 2;
  const supports = async (mime: string) => {
    try {
      await canvasBlob(canvas, mime);
      return true;
    } catch {
      return false;
    }
  };
  const result = {
    webp: await supports('image/webp'),
    avif: await supports('image/avif'),
  };
  releaseCanvas(canvas);
  return result;
}
export async function rasterSvg(canvas: HTMLCanvasElement): Promise<Blob> {
  const png = await canvasBlob(canvas, 'image/png');
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(png);
  });
  return new Blob(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><title>PDF page — embedded raster image, not editable vectors</title><image width="${canvas.width}" height="${canvas.height}" href="${data}"/></svg>`,
    ],
    { type: 'image/svg+xml' },
  );
}
