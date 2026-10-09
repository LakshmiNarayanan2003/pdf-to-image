import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  FileImage,
  Check,
  Trash2,
  Replace,
  ArrowUpRight,
} from 'lucide-react';
import { formatBytes } from '../lib/utils';
import type { useConverter } from '../hooks/useConverter';
import { PageImage } from './Preview';
export function Workspace({
  session,
}: {
  session: ReturnType<typeof useConverter>;
}) {
  const {
    docs,
    selected,
    setSelected,
    setActiveId,
    page,
    setPage,
    busy,
    dragging,
    setDragging,
    pickerRef,
    replaceRef,
    active,
    remove,
    clear,
    ingest,
    sample,
  } = session;
  const browse = (isReplace = false) => {
    replaceRef.current = isReplace;
    pickerRef.current?.click();
  };
  const thumbStart = Math.floor((page - 1) / 8) * 8 + 1;
  return (
    <div className="workspace">
      <input
        ref={pickerRef}
        hidden
        aria-label="PDF file picker"
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={(event) => {
          void ingest(Array.from(event.target.files ?? []), replaceRef.current);
          event.target.value = '';
        }}
        disabled={busy}
      />
      {!docs.length ? (
        <div
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void ingest(Array.from(event.dataTransfer.files));
          }}
        >
          <div className="paper-art" aria-hidden="true">
            <div className="paper back" />
            <div className="paper front">
              <span>PDF</span>
              <i />
              <i />
              <i />
              <div>
                <FileImage size={26} strokeWidth={1.4} />
              </div>
            </div>
            <span className="art-star">✦</span>
          </div>
          <h2>A fresh perspective for your PDFs.</h2>
          <p>Drag & drop your files here</p>
          <button
            className="button primary browse-button"
            onClick={() => browse()}
            disabled={busy}
          >
            <Plus size={18} />
            Choose PDF files
          </button>
          <span className="drop-hint">
            or drop multiple PDFs · up to 100 MB each
          </span>
          <div className="sample-divider">
            <span />
            JUST EXPLORING?
            <span />
          </div>
          <button
            className="sample-button"
            onClick={() => void sample()}
            disabled={busy}
          >
            Try sample PDF <ArrowUpRight size={15} />
          </button>
          <span className="sample-hint">
            3 pages of color, type & possibility
          </span>
        </div>
      ) : (
        <>
          <div className="workspace-toolbar">
            <h2>
              Your workspace{' '}
              <span>
                {docs.length} PDF{docs.length > 1 ? 's' : ''}
              </span>
            </h2>
            <div>
              <button
                className="text-button"
                onClick={() => browse()}
                disabled={busy}
              >
                <Plus size={15} />
                Add PDFs
              </button>
              <button
                className="icon-button"
                onClick={clear}
                disabled={busy}
                aria-label="Clear all files"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="file-list">
            {docs.map((doc) => (
              <div
                className={`file-row ${doc.id === active?.id ? 'active' : ''}`}
                key={doc.id}
              >
                <input
                  type="checkbox"
                  aria-label={`Include ${doc.name} in export`}
                  checked={selected.includes(doc.id)}
                  disabled={busy}
                  onChange={(event) =>
                    setSelected((ids) =>
                      event.target.checked
                        ? [...ids, doc.id]
                        : ids.filter((id) => id !== doc.id),
                    )
                  }
                />
                <button
                  className="file-select"
                  onClick={() => {
                    setActiveId(doc.id);
                    setPage(1);
                  }}
                  disabled={busy}
                >
                  <FileImage size={20} />
                  <span>
                    <strong className="break-name">{doc.name}</strong>
                    <small>
                      {doc.pdf.numPages} pages · {formatBytes(doc.size)}
                    </small>
                  </span>
                </button>
                <button
                  className="icon-button"
                  aria-label={`Remove ${doc.name}`}
                  disabled={busy}
                  onClick={() => remove(doc.id)}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          {active && (
            <>
              <div className="preview-heading">
                <span>PAGE PREVIEW</span>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => browse(true)}
                >
                  <Replace size={13} />
                  Replace PDF
                </button>
              </div>
              <div className="preview-stage">
                <PageImage
                  key={`${active.id}-${page}`}
                  doc={active}
                  page={page}
                />
                <span className="preview-tag">
                  PREVIEW · EXPORT AT YOUR CHOSEN DPI
                </span>
              </div>
              <div className="page-navigation">
                <button
                  className="icon-button"
                  aria-label="Previous page"
                  disabled={page <= 1 || busy}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <label>
                  Page{' '}
                  <input
                    aria-label="Preview page number"
                    type="number"
                    min={1}
                    max={active.pdf.numPages}
                    value={page}
                    disabled={busy}
                    onChange={(event) =>
                      setPage(
                        Math.max(
                          1,
                          Math.min(
                            active.pdf.numPages,
                            Number(event.target.value) || 1,
                          ),
                        ),
                      )
                    }
                  />{' '}
                  of {active.pdf.numPages}
                </label>
                <button
                  className="icon-button"
                  aria-label="Next page"
                  disabled={page >= active.pdf.numPages || busy}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="thumbnails" aria-label="Page thumbnails">
                {Array.from(
                  {
                    length: Math.min(8, active.pdf.numPages - thumbStart + 1),
                  },
                  (_, i) => thumbStart + i,
                ).map((number) => (
                  <button
                    key={`${active.id}-${number}`}
                    aria-label={`Preview page ${number}`}
                    aria-pressed={page === number}
                    className={page === number ? 'selected' : ''}
                    onClick={() => setPage(number)}
                    disabled={busy}
                  >
                    <PageImage doc={active} page={number} thumbnail />
                    <span>{number}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
      <div className="workspace-footnote">
        <LockKeyhole size={13} />
        <span>Processed on your device. Never on a server.</span>
        <Check size={14} />
      </div>
    </div>
  );
}
