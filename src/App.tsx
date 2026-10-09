import { useConverter } from './hooks/useConverter';
import { formatBytes } from './lib/utils';
import {
  Upload,
  LockKeyhole,
  Check,
  CircleCheck,
  Download,
} from 'lucide-react';
import { Workspace } from './components/Workspace';
import { Header, Hero } from './components/Brand';
import { PasswordDialog } from './components/PasswordDialog';
import { Settings } from './components/Settings';
import { Info } from './components/Info';
export default function App() {
  const session = useConverter();
  const {
    options,
    setOptions,
    codecs,
    busy,
    progress,
    errors,
    setErrors,
    notice,
    password,
    result,
    dark,
    setDark,
    operationRef,
    targetDocs,
    count,
    exportFiles,
  } = session;
  return (
    <>
      <a className="skip-link" href="#converter">
        Skip to converter
      </a>
      <Header dark={dark} onToggle={() => setDark(!dark)} />
      <main>
        <Hero />
        <section
          id="converter"
          className="converter"
          aria-label="PDF converter"
        >
          <div className="converter-bar">
            <span>
              <span className="status-dot" /> THE LOCAL CONVERTER
            </span>
            <span>
              <LockKeyhole size={13} /> Private by design
            </span>
          </div>
          <div className="converter-body">
            <Workspace session={session} />
            <Settings
              options={options}
              onChange={setOptions}
              codecs={codecs}
              busy={busy}
              available={targetDocs.length > 0}
              progress={progress}
              onExport={() => void exportFiles()}
              onCancel={() => operationRef.current?.abort()}
              count={count}
            />
          </div>
          {errors.length > 0 && (
            <div className="message error" role="alert">
              {errors.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
              <button className="text-button" onClick={() => setErrors([])}>
                Dismiss
              </button>
            </div>
          )}
          <div className="live-status" role="status" aria-live="polite">
            {notice && (
              <div className={`message ${result ? 'success' : ''}`}>
                <CircleCheck size={18} />
                <span>{notice}</span>
                {result && (
                  <a
                    href={result.url}
                    download={result.name}
                    className="button secondary"
                  >
                    <Download size={15} />
                    Download again · {formatBytes(result.blob.size)}
                  </a>
                )}
              </div>
            )}
          </div>
          {result && /^image\/(png|jpeg|webp|avif)$/.test(result.blob.type) && (
            <details className="result-preview">
              <summary>View exported image</summary>
              <img
                src={result.url}
                alt="Exported page at selected resolution"
              />
            </details>
          )}
        </section>
        <div className="under-converter">
          <span>
            <Check size={14} />
            PNG, JPG, WebP & raster-backed SVG
          </span>
          <span>
            <Upload size={14} />
            Batch export, without the upload
          </span>
          <span>
            <Check size={14} />
            No sign-up. No paid quotas.
          </span>
        </div>
        <Info />
      </main>
      {password && (
        <PasswordDialog
          key={`${password.name}-${password.incorrect}`}
          request={password}
        />
      )}
    </>
  );
}
