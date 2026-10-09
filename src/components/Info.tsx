import { ArrowUpRight, ShieldCheck, Sparkles, Layers3 } from 'lucide-react';
export const SOURCE = 'https://github.com/LakshmiNarayanan2003/pdf-to-image';
const faq = [
  [
    'Do my documents ever leave my device?',
    'No. Selected PDFs are read into browser memory and processed by a local PDF.js worker. The site downloads its own static code, fonts and rendering assets, but sends no document bytes, names or extracted text. There are no analytics, accounts or conversion servers.',
  ],
  [
    'Is the SVG output editable vector artwork?',
    'No. SVG (embedded raster image) wraps a PNG in a valid SVG file. It preserves the raster appearance at your chosen DPI, but does not preserve editable text, paths or vectors. Choose PNG if you do not need an SVG container.',
  ],
  [
    'Can I convert password-protected PDFs?',
    'Yes, for encryption supported by PDF.js. Enter your password in the local dialog. It stays in memory and is never stored or transmitted. Some encrypted or unsupported files may still fail to open.',
  ],
  [
    'What about fonts and complex PDF features?',
    'Embedded fonts and bundled standard fonts/CMaps are rendered locally. Missing fonts, unusual color spaces, XFA forms, signatures and interactive content may look different. Exports capture page appearance, not interactive features. Inspect important exports.',
  ],
  [
    'How large can my files be?',
    'There are no paid quotas. Browser resources still have limits: 100 MB per PDF, 200 MB total input, 20 documents, 500 pages per export, 16 megapixels per page and 128 MB of encoded output per batch. Lower the DPI or export fewer pages if you reach a limit.',
  ],
  [
    'Does this work offline? And is text extraction OCR?',
    'Once loaded, conversion uses your browser. Rendering assets may still need a same-origin download, so offline operation is not guaranteed. TXT and JSON extract existing selectable text, not OCR; scanned pages without text will produce empty text.',
  ],
];
export function Info() {
  return (
    <>
      <section id="how-it-works" className="how section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              LESS FRICTION. MORE POSSIBILITY.
            </span>
            <h2>From pages to pixels, in seconds.</h2>
          </div>
          <p>Three simple steps. Everything stays with you.</p>
        </div>
        <div className="steps">
          {[
            [
              '01',
              'Pick your PDFs',
              'Drop in one document or a whole collection.',
            ],
            [
              '02',
              'Make them yours',
              'Choose your format, resolution and the pages you need.',
            ],
            [
              '03',
              'Save your images',
              'Download a single image or a neatly packaged ZIP.',
            ],
          ].map(([number, title, body]) => (
            <article key={number}>
              <span className="step-number">{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="privacy-panel section" id="privacy">
        <div className="privacy-icon">
          <ShieldCheck size={36} strokeWidth={1.3} />
        </div>
        <div>
          <span className="section-label">YOUR FILES. YOUR BUSINESS.</span>
          <h2>Privacy is how it’s built.</h2>
          <p>
            Your browser does the work. PDFs stay in memory on your device, with
            no uploads, document storage or analytics. Close the tab and the app
            releases your session.
          </p>
          <a
            href={`${SOURCE}/blob/master/PRIVACY.md`}
            target="_blank"
            rel="noreferrer"
          >
            Read the privacy architecture <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="privacy-points">
          <span>
            <ShieldCheck size={18} /> No conversion server
          </span>
          <span>
            <Layers3 size={18} /> No document history
          </span>
          <span>
            <Sparkles size={18} /> Open for inspection
          </span>
        </div>
      </section>
      <section id="faq" className="faq section">
        <div>
          <span className="section-label">A FEW THINGS TO KNOW</span>
          <h2>
            Good questions.
            <br />
            Clear answers.
          </h2>
          <p>
            Built to be useful.
            <br />
            Honest about the details.
          </p>
          <a href={`${SOURCE}/issues`} target="_blank" rel="noreferrer">
            Something else? Open an issue <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="faq-list">
          {faq.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <footer>
        <a href="#" className="wordmark">
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width="28"
            height="28"
          />
          PDF2Pix
        </a>
        <span>Made for your files. Designed for your privacy.</span>
        <nav aria-label="Footer">
          <a href={SOURCE}>GitHub</a>
          <a href={`${SOURCE}/blob/master/LICENSE`}>MIT License</a>
          <a href={`${SOURCE}/blob/master/PRIVACY.md`}>Privacy</a>
          <a href={`${SOURCE}#readme`}>Docs</a>
        </nav>
        <small>v0.1.0 · Free & open source</small>
      </footer>
    </>
  );
}
