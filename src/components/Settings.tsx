import {
  ArrowUpRight,
  Download,
  Check,
  Image,
  FileCode2,
  FileText,
} from 'lucide-react';
import type { ExportOptions, Format, Progress } from '../lib/types';
const formats: { id: Format; label: string; description: string }[] = [
  { id: 'png', label: 'PNG', description: 'Crisp & transparent' },
  { id: 'jpeg', label: 'JPG', description: 'Small & shareable' },
  { id: 'webp', label: 'WebP', description: 'Modern & compact' },
  { id: 'svg', label: 'SVG', description: 'Embedded raster' },
];
export function Settings({
  options,
  onChange,
  codecs,
  busy,
  available,
  progress,
  onExport,
  onCancel,
  count,
}: {
  options: ExportOptions;
  onChange: (value: ExportOptions) => void;
  codecs: { webp: boolean; avif: boolean };
  busy: boolean;
  available: boolean;
  progress: Progress | null;
  onExport: () => void;
  onCancel: () => void;
  count: number;
}) {
  const update = (part: Partial<ExportOptions>) =>
    onChange({ ...options, ...part });
  const text = options.format === 'txt' || options.format === 'json';
  return (
    <aside className="settings">
      <div className="section-label">MAKE IT YOURS</div>
      <h2>Export settings</h2>
      <fieldset disabled={busy}>
        <legend>Image format</legend>
        <div className="format-grid">
          {formats.map((format) => (
            <button
              type="button"
              key={format.id}
              aria-pressed={options.format === format.id}
              disabled={format.id === 'webp' && !codecs.webp}
              title={
                format.id === 'webp' && !codecs.webp
                  ? 'WebP encoding is unavailable in this browser'
                  : undefined
              }
              className={`format-tile ${options.format === format.id ? 'selected' : ''}`}
              onClick={() => update({ format: format.id })}
            >
              {format.id === 'svg' ? (
                <FileCode2 size={18} />
              ) : (
                <Image size={18} />
              )}
              <strong>{format.label}</strong>
              <span>{format.description}</span>
              {options.format === format.id && (
                <Check className="format-check" size={13} />
              )}
            </button>
          ))}
        </div>
        {!codecs.webp && (
          <p className="setting-note">
            WebP encoding is unavailable in this browser.
          </p>
        )}
        {options.format === 'svg' && (
          <p className="format-note">
            SVG contains an embedded PNG. It is not editable or
            vector-preserving.
          </p>
        )}
        <label htmlFor="extra-format" className="extra-label">
          <FileText size={14} /> More formats & text extraction
        </label>
        <select
          id="extra-format"
          value={
            ['txt', 'json', 'avif'].includes(options.format)
              ? options.format
              : ''
          }
          onChange={(event) => {
            if (event.target.value)
              update({ format: event.target.value as Format });
          }}
        >
          <option value="" disabled>
            Choose an additional format
          </option>
          {codecs.avif && (
            <option value="avif">AVIF (browser supported)</option>
          )}
          <option value="txt">TXT — selectable text, no OCR</option>
          <option value="json">JSON — structured text, no OCR</option>
        </select>
        {text && (
          <p className="setting-note">
            Extract existing selectable text. Scanned pages may have no text.
            This is not OCR.
          </p>
        )}
        {!text && (
          <>
            <label htmlFor="dpi">
              Resolution <span className="label-hint">DPI</span>
            </label>
            <div className="dpi-row">
              <select
                id="dpi"
                value={
                  [72, 96, 150, 200, 300].includes(options.dpi)
                    ? options.dpi
                    : 'custom'
                }
                onChange={(event) =>
                  update({
                    dpi:
                      event.target.value === 'custom'
                        ? 144
                        : Number(event.target.value),
                  })
                }
              >
                {[72, 96, 150, 200, 300].map((dpi) => (
                  <option key={dpi} value={dpi}>
                    {dpi} DPI
                    {dpi === 150
                      ? ' · balanced'
                      : dpi === 300
                        ? ' · print'
                        : ''}
                  </option>
                ))}
                <option value="custom">Custom DPI</option>
              </select>
              <input
                type="number"
                min="36"
                max="600"
                aria-label="Custom DPI"
                value={options.dpi || ''}
                onChange={(event) =>
                  update({ dpi: Number(event.target.value) })
                }
              />
            </div>
            <p className="setting-note">
              Higher DPI means more detail and larger files.
            </p>
          </>
        )}
        {['jpeg', 'webp', 'avif'].includes(options.format) && (
          <>
            <label htmlFor="quality">
              Quality <span>{Math.round(options.quality * 100)}%</span>
            </label>
            <input
              id="quality"
              type="range"
              min="10"
              max="100"
              value={Math.round(options.quality * 100)}
              onChange={(event) =>
                update({ quality: Number(event.target.value) / 100 })
              }
            />
          </>
        )}
        <label htmlFor="pages">Pages to export</label>
        <select
          id="pages"
          value={options.mode}
          onChange={(event) =>
            update({ mode: event.target.value as ExportOptions['mode'] })
          }
        >
          <option value="all">All pages</option>
          <option value="current">Current page (active PDF only)</option>
          <option value="custom">Custom range (each checked PDF)</option>
        </select>
        {options.mode === 'custom' && (
          <>
            <label htmlFor="range">Page range</label>
            <input
              id="range"
              placeholder="e.g. 1-3,5,8-10"
              value={options.range}
              onChange={(event) => update({ range: event.target.value })}
            />
            <p className="setting-note">
              Range must be valid in every checked PDF.
            </p>
          </>
        )}
      </fieldset>
      <div className="export-area">
        {progress && (
          <div className="progress">
            <div role="status">{progress.stage}</div>
            <progress
              aria-label="Conversion progress"
              max={progress.total}
              value={progress.completed}
            />
          </div>
        )}
        {busy ? (
          <button className="button secondary full" onClick={onCancel}>
            Cancel processing
          </button>
        ) : (
          <button
            className="button primary full export-button"
            disabled={!available}
            onClick={onExport}
          >
            <Download size={18} />
            {count > 1 ? 'Export images' : 'Export image'}
            <ArrowUpRight size={16} className="export-arrow" />
          </button>
        )}
        <p className="export-caption">
          {available
            ? 'One image downloads directly. Multiple files become a ZIP.'
            : 'Add a PDF to get started.'}
        </p>
      </div>
    </aside>
  );
}
