export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_INPUT_BYTES = 200 * 1024 * 1024;
export const MAX_PIXELS = 16_000_000;
export const MAX_DIMENSION = 8192;
export const MAX_OUTPUT_BYTES = 128 * 1024 * 1024;
export const MAX_PAGES = 500;
export function parseRange(input: string, total: number): number[] {
  if (!input.trim()) throw new Error('Enter pages, for example 1-3,5.');
  const pages = new Set<number>();
  for (const raw of input.split(',')) {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(raw.trim());
    if (!match)
      throw new Error('Use page numbers and ranges, for example 1-3,5.');
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > total)
      throw new Error(
        `Pages must be between 1 and ${total}, in ascending ranges.`,
      );
    for (let page = start; page <= end; page++) pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
}
export function safeStem(name: string): string {
  return (
    name
      .replace(/\.pdf$/i, '')
      .normalize('NFKC')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'document'
  );
}
export function outputName(
  stem: string,
  page: number,
  total: number,
  ext: string,
): string {
  return `${stem}-page-${String(page).padStart(Math.max(3, String(total).length), '0')}.${ext === 'jpeg' ? 'jpg' : ext}`;
}
export function dimensions(width: number, height: number, dpi: number) {
  if (!Number.isFinite(dpi) || dpi < 36 || dpi > 600)
    throw new Error('Choose a DPI between 36 and 600.');
  const w = Math.ceil((width * dpi) / 72);
  const h = Math.ceil((height * dpi) / 72);
  if (
    !Number.isFinite(w * h) ||
    w < 1 ||
    h < 1 ||
    w > MAX_DIMENSION ||
    h > MAX_DIMENSION ||
    w * h > MAX_PIXELS
  )
    throw new Error(
      'This page is too large at this DPI. Lower the DPI (maximum 16 megapixels / 8192 pixels per side).',
    );
  return { width: w, height: h };
}
export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function abortCheck(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
}
export function isCancelled(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
      error.name === 'RenderingCancelledException')
  );
}
export function friendlyError(error: unknown): string {
  if (isCancelled(error))
    return 'Cancelled. Your files are ready when you are.';
  if (
    error instanceof Error &&
    /InvalidPDF|MissingPDF|UnknownError/.test(error.name)
  )
    return 'This PDF could not be read. It may be corrupt or use unsupported features.';
  // Never echo PDF.js parser messages: they can include document contents.
  return error instanceof UserError
    ? error.message
    : 'Something went wrong processing this PDF. Try fewer pages or a lower DPI.';
}
export class UserError extends Error {}
export async function validateFile(file: File) {
  if (
    !/\.pdf$/i.test(file.name) ||
    (file.type &&
      !['application/pdf', 'application/octet-stream'].includes(file.type))
  )
    throw new UserError('Choose a PDF file with a .pdf extension.');
  if (!file.size)
    throw new UserError('This file is empty. Choose a valid PDF.');
  if (file.size > MAX_FILE_BYTES)
    throw new UserError(
      'This file exceeds the 100 MB safety limit. Split it into smaller PDFs first.',
    );
  const header = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if (!new TextDecoder('latin1').decode(header).includes('%PDF-'))
    throw new UserError('This file does not have a valid PDF signature.');
}
