# Changelog

All notable changes are documented here using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions. Versions follow semantic versioning.

## [0.1.0] - 2026-10-09

### Added

- Browser-local PDF.js conversion to PNG, JPEG and supported native WebP.
- Explicit **SVG (embedded raster image)** export; it contains PNG and is not editable/vector-preserving.
- Conditional AVIF probe and local TXT/JSON selectable-text extraction (no OCR).
- Multi-file workspace, previews, bounded thumbnails, all/current/custom page selection and ZIP export.
- DPI presets/custom bounds, native quality controls, alpha preservation and white JPEG backgrounds.
- Password dialog, progress, cancellation, recovery and deterministic safe filenames.
- Original deterministic three-page sample, edge fixtures and an encrypted public fixture.
- Responsive light/dark UI, semantic controls and automated accessibility coverage.
- Strict TypeScript, output-aware browser tests, sentinel network checks, static asset/security checks and CI/Pages workflows.
- Privacy, security, contribution, architecture, format, testing and deployment documentation.

### Security

- Byte-only document loading, local workers/fonts/CMaps/WASM, restrictive CSP and no app persistence, analytics or service workers.
- Explicit file, batch, page and canvas safety limits, including rejection before allocating extreme page lists; cleanup on navigation/removal/cancellation.
- No untrusted SVG elements or raw HTML injection from extracted content.

### Fixed during verification

- Current PDF.js lifecycle API usage, accessible picker naming, light-mode contrast, atomic theme changes to avoid transient contrast failures, and mobile hidden-input overflow.

### Known limitations

- SVG is raster-backed; TIFF/OCR/office exports and vector SVG are absent.
- Full offline operation is not guaranteed. Large/hostile PDFs can exceed browser resources.
- This is an initial 0.1.0 release; local cross-browser and live publication evidence is recorded separately in [verification](docs/VERIFICATION.md). Do not infer a deployed or stable 1.0 release from this changelog.
