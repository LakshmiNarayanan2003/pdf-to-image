import type { LoadedDocument } from './types';
export async function disposeDocument(doc: LoadedDocument) {
  await doc.pdf.loadingTask.destroy();
}
