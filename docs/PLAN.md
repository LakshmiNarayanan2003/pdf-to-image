# Implementation plan

- [x] Inspect initial repository, installed Node and official PDF.js / GitHub Pages documentation.
- [x] Decide on React + strict TypeScript, Vite, Tailwind, PDF.js and JSZip. Keep the existing MIT license.
- [x] Implement bounded local conversion, safe filenames, page selections and lifecycle cleanup.
- [x] Generate a distributable sample and edge fixtures.
- [x] Build responsive accessible workspace, theme, password handling and progress.
- [x] Verify actual output, privacy, keyboard and accessibility in installed Chromium (19 passing browser tests).
- [x] Verify Firefox/WebKit and pinned Chromium: 55 passing browser tests, 2 deliberate Chromium-only baseline skips, zero failures.
- [x] Document shipped behavior, limitations, security and development.
- [x] Add CI / Pages and run clean local release gates (43 unit/component tests; 19 browser tests; alternate-base smoke test).
- [x] Commit and push main; observe successful GitHub CI and deployment quality gates.
- [ ] Publish Pages: owner must enable public Pages/Actions; integration settings writes return 403.

## Decisions

The canonical deployment base is `/pdf-to-image/`, matching the requested repository and preferred URL. `VITE_BASE_PATH=/pdf2pix/` remains a supported tested override. A GitHub project site cannot acquire a different project path solely through Vite configuration.

SVG will embed a PNG with an explicit fidelity label. No maintained SVG renderer is exported by modern PDF.js. A second PDF interpreter is unjustified for this first release. TXT / JSON extract existing text, never OCR. AVIF appears only after successful native encoding detection. TIFF is deferred.

Keep version 0.1.0 until cross-browser and deployment evidence supports promotion. Initial network restrictions were resolved. GitHub reads work, but repository-setting updates and Pages creation are denied by the connected integration. No credentials will be requested or extracted.
