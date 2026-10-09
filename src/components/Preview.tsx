import { useEffect, useRef, useState } from 'react';
import type { LoadedDocument } from '../lib/types';
import { canvasBlob, releaseCanvas, renderPage } from '../lib/render';
import { isCancelled } from '../lib/utils';
export function PageImage({
  doc,
  page,
  thumbnail = false,
}: {
  doc: LoadedDocument;
  page: number;
  thumbnail?: boolean;
}) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    let started = false;
    const render = async () => {
      if (started || controller.signal.aborted) return;
      started = true;
      try {
        const pdfPage = await doc.pdf.getPage(page);
        const v = pdfPage.getViewport({ scale: 1 });
        const dpi = Math.max(
          36,
          Math.min(
            96,
            ((thumbnail ? 140 : 900) / Math.max(v.width, v.height)) * 72,
          ),
        );
        const canvas = await renderPage(doc.pdf, page, dpi, controller.signal);
        try {
          const blob = await canvasBlob(canvas, 'image/png');
          if (!controller.signal.aborted) {
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
          }
        } finally {
          releaseCanvas(canvas);
        }
      } catch (e) {
        if (!controller.signal.aborted && !isCancelled(e)) setError(true);
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void render();
      },
      { rootMargin: '120px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      controller.abort();
      observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, page, thumbnail]);
  return (
    <div
      ref={ref}
      className={thumbnail ? 'thumb-image' : 'page-image'}
      aria-busy={!url && !error}
    >
      {url ? (
        <img
          src={url}
          alt={`${thumbnail ? 'Thumbnail' : 'Preview'} of page ${page}`}
        />
      ) : (
        <span className="preview-placeholder">
          {error
            ? 'Preview unavailable. Try exporting at lower DPI.'
            : 'Rendering…'}
        </span>
      )}
    </div>
  );
}
