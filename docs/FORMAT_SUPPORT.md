# Format support

PNG, JPEG and WebP rasterize the PDF with PDF.js using its crop box, rotation and viewport. Pixel dimensions are `ceil(viewport points × DPI / 72)`. Alpha is retained in PNG/WebP; JPEG starts with white. Native JPEG/WebP encoding is lossy and can shift even near-white pixels slightly at low quality.

SVG **embeds a PNG**, with explicit width, height and viewBox. It is not editable/vector-preserving, and enlarging it does not restore detail. The SVG contains only a static title and a single self-contained image; no scripts, events or external references are copied from the PDF. The app, README, FAQ, tests and changelog all use this same fidelity description.

Modern maintained PDF.js does not expose its old SVGGraphics renderer. A second interpreter such as a WASM PDF engine brings additional download size, feature coverage and licensing obligations; no unverified vector claim is made. A future renderer must pass representative text/font/transparency/clip/image tests and a license review.

TXT outputs reading-order text items with line endings supplied by PDF.js. JSON includes page number, rotation, view and item text/position/size. Neither is OCR or exact semantic/layout reconstruction. Scanned pages can produce empty TXT/JSON item arrays.

AVIF is offered only when a two-pixel canvas really produces `image/avif`. Every export checks its MIME again. It was unavailable in the locally tested Chromium. WebP is similarly detected; browsers without it show an explanation and disable that tile. TIFF is omitted because no additional browser codec has been selected and validated for its complexity and memory cost.

PDF fidelity limitations include missing fonts, unusual color management, XFA (disabled), signatures, video, JavaScript and interactive forms/annotations. This converter renders page appearance rather than exporting interactions. There is no claim of lossless preservation of an entire PDF or universally identical rendering across browsers. Keep originals and inspect important exports.
