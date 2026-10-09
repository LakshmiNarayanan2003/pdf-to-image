import type { ExportOptions, LoadedDocument, Output, Progress } from './types';
import {
  abortCheck,
  MAX_OUTPUT_BYTES,
  MAX_PAGES,
  outputName,
  parseRange,
  safeStem,
  UserError,
} from './utils';
import { canvasBlob, rasterSvg, releaseCanvas, renderPage } from './render';
export function planExport(docs: LoadedDocument[], options: ExportOptions) {
  const used = new Set<string>();
  return docs.map((doc) => {
    let stem = safeStem(doc.name);
    let suffix = 2;
    while (used.has(stem.toLowerCase()))
      stem = `${safeStem(doc.name)}-${suffix++}`;
    used.add(stem.toLowerCase());
    let pages: number[];
    try {
      pages =
        options.mode === 'all'
          ? Array.from({ length: doc.pdf.numPages }, (_, i) => i + 1)
          : options.mode === 'current'
            ? [Math.min(options.current, doc.pdf.numPages)]
            : parseRange(options.range, doc.pdf.numPages);
    } catch (error) {
      throw new UserError((error as Error).message);
    }
    return { doc, stem, pages };
  });
}
export async function convert(
  docs: LoadedDocument[],
  options: ExportOptions,
  signal: AbortSignal,
  onProgress: (progress: Progress) => void,
): Promise<Output> {
  const plan = planExport(docs, options);
  const total = plan.reduce((sum, item) => sum + item.pages.length, 0);
  if (!total) throw new UserError('Select at least one PDF to export.');
  if (total > MAX_PAGES)
    throw new UserError(
      'Export up to 500 pages at a time. Choose a smaller range.',
    );
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  let completed = 0;
  let bytes = 0;
  let single: Output | undefined;
  for (const { doc, stem, pages } of plan)
    for (const number of pages) {
      abortCheck(signal);
      onProgress({
        completed,
        total,
        stage: `Rendering page ${completed + 1} of ${total}`,
      });
      let blob: Blob;
      if (options.format === 'txt' || options.format === 'json') {
        const page = await doc.pdf.getPage(number);
        try {
          const content = await page.getTextContent();
          abortCheck(signal);
          const items = content.items
            .filter((item) => 'str' in item)
            .map((item) => ({
              text: item.str,
              transform: item.transform,
              width: item.width,
              height: item.height,
              endOfLine: item.hasEOL,
            }));
          const text =
            options.format === 'json'
              ? JSON.stringify(
                  {
                    page: number,
                    rotation: page.rotate,
                    view: page.view,
                    items,
                  },
                  null,
                  2,
                )
              : items
                  .map((item) => item.text + (item.endOfLine ? '\n' : ' '))
                  .join('');
          blob = new Blob([text], {
            type:
              options.format === 'json'
                ? 'application/json'
                : 'text/plain;charset=utf-8',
          });
        } finally {
          page.cleanup();
        }
      } else {
        const canvas = await renderPage(
          doc.pdf,
          number,
          options.dpi,
          signal,
          options.format === 'jpeg',
        );
        try {
          blob =
            options.format === 'svg'
              ? await rasterSvg(canvas)
              : await canvasBlob(
                  canvas,
                  `image/${options.format}`,
                  options.quality,
                );
        } finally {
          releaseCanvas(canvas);
        }
      }
      abortCheck(signal);
      bytes += blob.size;
      if (bytes > MAX_OUTPUT_BYTES)
        throw new UserError(
          'This batch exceeds the 128 MB output limit. Export fewer pages or lower the DPI.',
        );
      const name = outputName(stem, number, doc.pdf.numPages, options.format);
      if (total === 1) single = { name, blob };
      else zip.file(name, await blob.arrayBuffer());
      completed++;
      onProgress({
        completed,
        total,
        stage: `Converted ${completed} of ${total} pages`,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  abortCheck(signal);
  if (single) return single;
  onProgress({ completed, total, stage: 'Packing ZIP…' });
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE', streamFiles: true },
    () => abortCheck(signal),
  );
  abortCheck(signal);
  return { name: 'pdf2pix-images.zip', blob };
}
export function downloadUrl(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
}
