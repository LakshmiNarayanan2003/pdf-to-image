# Decisions and sources

1. **Canonical base:** `/pdf-to-image/` matches the actual repository and preferred URL. `/pdf2pix/` is a tested build override, not a claim of a second published site.
2. **Local PDF.js raster pipeline:** maintained Mozilla code, byte-based input, bundled worker and same-origin fonts/CMaps/WASM. Current installed TypeScript definitions are the API authority. PDF.js 6 uses `pdf.loadingTask.destroy()`; there is no supported SVGGraphics export.
3. **SVG fallback:** embed PNG and label the limitation at selection time. No vector fidelity claim. Additional renderers remain an explicit future investigation.
4. **Native codecs:** asynchronous canvas `toBlob`, actual MIME detection, conservative limits. AVIF is conditional; TIFF is omitted.
5. **Static-only privacy:** no account, backend, analytics, document persistence or service worker. Use a restrictive meta CSP compatible with GitHub Pages and test real rendering against it.
6. **Memory:** sequential full-size export, lazy bounded preview groups, explicit input/canvas/encoded-output caps. In-memory ZIP trades implementation portability for a documented finite batch limit.
7. **Tooling:** Node 24 LTS, npm lockfile, React/TypeScript/Vite/Tailwind, Vitest/Testing Library and Playwright/axe. Standard semantic HTML reduces UI dependencies.
8. **Release:** 0.1.0 while cross-browser and live publication evidence is incomplete. Functional optional extraction ships now without waiting for a milestone name.

References consulted during implementation:

- [PDF.js source/API](https://github.com/mozilla/pdf.js/blob/master/src/display/api.js), the installed `pdfjs-dist` API types and [bundled worker example](https://github.com/mozilla/pdf.js/tree/master/examples/webpack).
- [Vite static asset handling](https://vite.dev/guide/assets.html).
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) (read through GitHub's official documentation source when the documentation host was blocked).
- [Official Pages documentation source](https://github.com/github/docs/blob/main/content/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages.md), including configure-pages v5, upload-pages-artifact v4 and deploy-pages v4.

The reference site's public domain was blocked by the environment, so the interface is an original design based on the requested restrained palette and product requirements.
