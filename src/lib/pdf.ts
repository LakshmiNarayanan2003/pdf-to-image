import {
  getDocument,
  GlobalWorkerOptions,
  PasswordResponses,
} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { LoadedDocument, PasswordRequest } from './types';
import { abortCheck, UserError, validateFile } from './utils';
GlobalWorkerOptions.workerSrc = workerUrl;
const asset = (path: string) =>
  new URL(`${import.meta.env.BASE_URL}pdfjs/${path}/`, window.location.origin)
    .href;
export async function loadPdf(
  file: File,
  signal: AbortSignal,
  onPassword: (request: PasswordRequest | null) => void,
): Promise<LoadedDocument> {
  await validateFile(file);
  abortCheck(signal);
  const bytes = new Uint8Array(await file.arrayBuffer());
  abortCheck(signal);
  const task = getDocument({
    data: bytes,
    cMapUrl: asset('cmaps'),
    cMapPacked: true,
    standardFontDataUrl: asset('standard_fonts'),
    wasmUrl: asset('wasm'),
    useWorkerFetch: true,
    useSystemFonts: false,
    enableXfa: false,
    stopAtErrors: true,
    verbosity: 0,
    canvasMaxAreaInBytes: 64_000_000,
  });
  const cancel = () => {
    void task.destroy();
  };
  signal.addEventListener('abort', cancel, { once: true });
  task.onPassword = (submit: (password: string) => void, reason: number) =>
    onPassword({
      name: file.name,
      incorrect: reason === PasswordResponses.INCORRECT_PASSWORD,
      submit: (password) => {
        onPassword(null);
        submit(password);
      },
      cancel,
    });
  try {
    const pdf = await task.promise;
    if (signal.aborted) {
      await pdf.loadingTask.destroy();
      abortCheck(signal);
    }
    if (!pdf.numPages) {
      await pdf.loadingTask.destroy();
      throw new UserError('This PDF has no pages.');
    }
    return { id: crypto.randomUUID(), name: file.name, size: file.size, pdf };
  } catch (error) {
    await task.destroy();
    throw error;
  } finally {
    onPassword(null);
    signal.removeEventListener('abort', cancel);
  }
}
