# Privacy architecture

PDF2Pix 0.1.0 is a static, browser-local application. There is no conversion backend, account system, analytics, telemetry or document upload endpoint.

## Data flow

The browser reads selected `File` objects into ArrayBuffers. PDF.js receives in-memory bytes, not URLs. A locally bundled worker parses each PDF. Pages render into canvases; native encoders create PNG/JPEG/WebP (or AVIF when the runtime supports it). SVG contains an encoded PNG. TXT/JSON use local selectable-text extraction. JSZip packages batches entirely in memory.

PDFs, names, passwords, page text and image outputs are not written to localStorage, sessionStorage, IndexedDB, caches, logs or a service worker. There is no service worker and even the theme is session-only. Passwords live only in the dialog/loading flow. Application errors are generic to avoid echoing parser messages containing document content. PDF.js logging verbosity is disabled.

Downloads are explicitly initiated by the user; the browser/OS may retain them in its normal downloads folder. This is separate from app storage.

## Network behavior

Initial navigation fetches the site's HTML, JS, CSS and icon. PDF.js worker code, standard fonts, CMaps and WASM are same-origin static assets and may load on demand; they are never chosen from remote hosts supplied by a PDF. No external runtime scripts/fonts/CDNs are used. Clicking **Try sample PDF** intentionally downloads the public bundled sample. User PDFs do not use that fetch path.

Source/docs/issue links navigate to GitHub only when clicked; they carry no document data. GitHub Pages and network providers can see normal site requests, IP addresses and headers. Asset selection can indicate a font/CMap needed by the renderer; these are standard static resources, not uploaded document metadata. Network tests whitelist only the expected static paths.

The HTML CSP restricts connections/scripts/workers to this origin, disables form submission and embedded objects, and limits images/fonts to local sources plus in-memory blob/data resources. `wasm-unsafe-eval` allows locally bundled WASM compilation, not JavaScript eval. `style-src 'unsafe-inline'` accommodates browser/React rendering styles; no document text is used as styles. GitHub Pages does not offer custom response headers; `frame-ancestors` cannot be enforced by a meta CSP. CSP is defense in depth, not a substitute for code review.

## Lifetime and resource limits

Removal/replacement/clearing destroys PDF loading tasks and their workers. Preview navigation/unmount cancels rendering and revokes preview URLs. Canvases are reset after encoding, and render listeners are removed. Starting another operation or clearing files releases the previous downloadable result URL. Cancellation stops queued work and the active PDF render; browser encoders and file reads may finish before temporary buffers can be collected. ZIP generation stops at its next progress callback.

JavaScript cannot promise secure memory erasure or control OS swap, browser memory management, extensions, browser downloads/history, developer tools or screenshots. Input caps reduce risk but PDF decompression can expand far beyond file size. Hostile PDFs are not risk-free. Use a current browser and inspect critical output.

## Evidence and limitations

Playwright loads a unique sentinel PDF, renders and exports it, records requests (including worker requests), and asserts only static same-origin GET requests with no request bodies. It checks that sentinel content/filename never appears on the network, CSP produces no violations, and browser storage/service-worker registrations remain empty. In-memory `blob:` image reads are verified as local resource reads, not HTTP traffic.

That test covers the exercised fixture and browser/build. It cannot prove the absence of every possible leak, guarantee safety against vulnerabilities, inspect browser extensions, or establish the integrity of future releases. See [test procedures](docs/TESTING.md) and [observed verification](docs/VERIFICATION.md).
