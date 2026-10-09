import { expect, it } from 'vitest';
import { planExport } from './export';
import type { LoadedDocument } from './types';
it('rejects extreme PDF page counts before allocating a page list', () => {
  const doc = {
    name: 'huge.pdf',
    pdf: { numPages: 1_000_000_000 },
  } as LoadedDocument;
  expect(() =>
    planExport([doc], {
      format: 'png',
      dpi: 72,
      quality: 0.92,
      mode: 'all',
      current: 1,
      range: '',
    }),
  ).toThrow('500 pages');
});
