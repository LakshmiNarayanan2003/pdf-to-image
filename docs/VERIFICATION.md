# Verification record

This file records observed evidence, not hypothetical CI or deployment success. Updated during the release gate.

- Runtime: Node 24.19.0 LTS, npm 11.9.0, Debian 13. Pinned Playwright Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2; system Chromium 151.0.7922.173 was also tested.
- Vitest: 41 unit/component tests passed (3 files), zero failed, zero skipped.
- Browser suite: 55 end-to-end tests passed across Chromium, Firefox and WebKit; zero failed. Two visual-baseline checks are intentionally skipped in Firefox/WebKit because the baseline is Chromium-specific. All functional/privacy/accessibility tests ran in all three engines. Includes actual sample PNG/JPEG/WebP/SVG, ZIP, dimensions, crop/rotation, extraction, privacy, password and accessibility checks.
- Clean npm ci, strict typecheck, lint, formatting, production build, static CSP/assets and 27 local documentation links passed. Deterministic fixture hashes were reproduced.
- Alternate `/pdf2pix/` production build: 1 sample/ZIP smoke test passed. Default `/pdf-to-image/` build restored afterward.
- Native AVIF: unavailable in observed Chromium, so not offered in the app.
- Initial browser download restrictions were resolved through the saved network configuration. Firefox required normal filesystem access for profiles. WebKit dependencies were downloaded from signed Debian repositories into the workspace, verified with the dynamic loader, and linked into its supported bundled library directory. The Playwright global ldconfig precheck was bypassed only because it cannot see those verified user-installed libraries; browser tests themselves were not bypassed. CI installs its system libraries normally and needs no such override.
- GitHub repository reads and native Git access work. Repository metadata updates and Pages creation both returned HTTP 403 `Resource not accessible by integration`. The repository is still private with default branch master and no Pages site. Push/workflow evidence will be recorded after the publication attempt.
- Dependency audits: both production-only and full dependency audits reported zero vulnerabilities during implementation.

No automated check is a universal security, accessibility or PDF-fidelity guarantee. See [testing scope](TESTING.md).
