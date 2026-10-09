# Testing

Use Node 24.19.0 and `npm ci`. All fixtures are original and public; never put private PDFs into tests, traces or screenshots.

## Required checks

```sh
npm run check
npm audit --audit-level=moderate
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

Vitest covers range grammar, ordering/deduplication, out-of-bounds pages, filename sanitization, padding, DPI math/limits, preallocation limits for extreme page counts/ranges, and safe error reporting, encoder failure, MIME fallback rejection, canvas release and sanitized SVG structure. Testing Library exercises format selection, honest SVG labels, codec availability, conditional quality controls and progress/cancellation semantics.

Playwright runs against the production Vite preview at the actual project subpath. It downloads and parses output, rather than only checking buttons:

- Three distinct sample PNG pages in a ZIP, with exact 72 DPI portrait/landscape dimensions.
- Actual JPEG, WebP and self-contained raster-backed SVG, file signatures and decodability.
- Exact custom-DPI dimensions, transparent PNG corners, near-white JPEG corners (lossy tolerance), and quality-dependent sizes.
- Batch filename collision handling, page ranges, per-file selection and recovery.
- Rotated/cropped/raster/vector fixtures with dimensions and nonempty appearance.
- Empty/renamed/corrupt input, mixed valid/invalid batches and subsequent success.
- TXT/JSON sentinel extraction, render cancellation and retry.
- Network request monitoring with a sentinel PDF containing an ignored JavaScript open action, same-origin static allowlist, no payloads/sentinels, CSP and no storage/service workers.
- Drop/picker flows, replace/remove/clear and observable object-URL revocation.
- Password rejection, correct unlock, password cancellation and subsequent successful load.
- Oversized file/DPI rejection without losing usable documents.
- Axe audits in light, dark, loaded and mobile states; keyboard skip link; no mobile horizontal overflow.
- A Chromium-only PDF preview pixel baseline. Other engines still validate actual output dimensions/content; visual baselines are deliberately not shared across engines.

## Baselines and artifacts

`tests/e2e/app.spec.ts-snapshots/` contains the reviewed real sample-page raster baseline. After an intentional rendering change, run `npx playwright test --project=chromium --update-snapshots`, inspect differences, then rerun without the update flag. Never update snapshots just to conceal a failure.

Test reports, failure screenshots and traces are ignored locally and uploaded for seven days by CI. Tests use only synthetic/public PDFs. Sparse oversized test files are generated in ignored `test-results/` and never committed.

```sh
npm run preview -- --port 4173
# In another terminal:
npm run screenshots
```

This regenerates real desktop/workspace/mobile screenshots and the original social card. Screenshots are documentation assets, not fabricated UI mockups.

## Restricted environments

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` explicitly selects a preinstalled browser. It does not disable any tests/assertions. To run only this supported engine, append `--project=chromium`. Firefox/WebKit tests remain configured; do not report them as passing without execution. See [verification](VERIFICATION.md).

An alternate-base smoke test is supported:

```sh
VITE_BASE_PATH=/pdf2pix/ npm run build
VITE_BASE_PATH=/pdf2pix/ npm run test:e2e -- --project=chromium --grep 'sample: all pages'
```

Stop any previous preview server first so the intended base/config is served. Restore the default build afterward. CI uses fresh preview processes.

## Scope limits

Network assertions exercise a representative sentinel document and static build. They cannot prove all documents safe, detect malicious browser extensions, guarantee all PDF features, or validate a later published deployment. Axe does not replace manual screen-reader, zoom/reflow, touch and cognitive accessibility evaluation. Test limits are part of the release evidence, not hidden skips.
