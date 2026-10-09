# Roadmap

Milestones describe quality goals, not promised dates. Implemented later-milestone capabilities are already available in 0.1.0 where noted.

## v0.1 — Dependable local conversion

- [x] PNG/JPEG/WebP, preview, ranges, multi-PDF ZIP, sample and privacy architecture.
- [x] DPI/quality controls, safe limits, output tests and documentation.

## v0.2 — Fidelity and large-file work

- [x] Honest raster-backed SVG with visible fidelity labels.
- [x] Sequential batch rendering, cancellation and bounded thumbnails.
- [ ] Explore streaming ZIP output to reduce peak memory.
- [ ] Broaden the complex-font/color/annotation regression corpus.
- [ ] Evaluate a maintained vector renderer with explicit licensing and fidelity gates.

## v0.3 — Optional formats and access

- [x] Conditional AVIF encoding detection; locally tested browser currently has no encoder.
- [x] TXT/JSON extraction, password dialog, keyboard flow and automated axe checks.
- [ ] Manual screen-reader and mobile Safari validation; improve touch target/zoom ergonomics.
- [ ] Validate AVIF where an actual native encoder is available.

## v1.0 — Observed cross-browser stable release

- [ ] Observe required checks in Chromium, Firefox and WebKit on supported platforms.
- [ ] Verify the actual public Pages deployment and download workflow.
- [ ] Resolve significant compatibility findings and expand adversarial/fidelity coverage.

## Future

Optional offline-first PWA only after designing a cache policy that cannot retain user documents. Additional useful local tools must preserve the same privacy boundaries. OCR, office formats, TIFF and true vector conversion are not advertised as current capabilities.
