# Verification record

This file records observed evidence, not hypothetical CI or deployment success. Updated during the release gate.

- Runtime: Node 24.19.0 LTS, npm 11.9.0, Debian 13. Pinned Playwright Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2; system Chromium 151.0.7922.173 was also tested.
- Vitest: 43 unit/component tests passed (4 files), zero failed, zero skipped.
- Browser suite: 55 end-to-end tests passed across Chromium, Firefox and WebKit; zero failed. Two visual-baseline checks are intentionally skipped in Firefox/WebKit because the baseline is Chromium-specific. All functional/privacy/accessibility tests ran in all three engines. Includes actual sample PNG/JPEG/WebP/SVG, ZIP, dimensions, crop/rotation, extraction, privacy, password and accessibility checks.
- Clean npm ci, strict typecheck, lint, formatting, production build, static CSP/assets and 27 local documentation links passed. Deterministic fixture hashes were reproduced.
- Alternate `/pdf2pix/` production build: 1 sample/ZIP smoke test passed. Default `/pdf-to-image/` build restored afterward.
- Native AVIF: unavailable in observed Chromium, Firefox and WebKit, so not offered in the app.
- Initial browser download restrictions were resolved through the saved network configuration. Firefox required normal filesystem access for profiles. WebKit dependencies were downloaded from signed Debian repositories into the workspace, verified with the dynamic loader, and linked into its supported bundled library directory. The Playwright global ldconfig precheck was bypassed only because it cannot see those verified user-installed libraries; browser tests themselves were not bypassed. CI installs its system libraries normally and needs no such override.
- GitHub repository reads and native Git access work. Repository metadata updates and Pages creation both returned HTTP 403 `Resource not accessible by integration`. The repository is still private with default branch master and no Pages site. The implementation was successfully pushed to main; native Git independently confirmed the remote SHA.
- Dependency audits: both production-only and full dependency audits reported zero vulnerabilities during implementation.

No automated check is a universal security, accessibility or PDF-fidelity guarantee. See [testing scope](TESTING.md).

## Remote workflow evidence

- Initial feature commit: `b29d400c033c36644f3e14640737a5e175f79556`.
- [CI run 37896474773](https://github.com/LakshmiNarayanan2003/pdf-to-image/actions/runs/37896474773): **success**, including all three browser engines and the alternate-base smoke test.
- [Deployment run 37896475142](https://github.com/LakshmiNarayanan2003/pdf-to-image/actions/runs/37896475142): quality job **success**; deployment failed at `actions/configure-pages@v5`. The check annotation states: “Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions.” The underlying Pages lookup returned 404.
- The site's intended URL currently returns HTTP 404. No live deployment is claimed.
- Final hardening adds preallocation limits for extreme page counts/ranges, with two regression tests (43 unit/component tests total) and six additional targeted cross-browser checks.

Required owner action: in repository Settings, make the repository public for the requested open-source release, set the default branch to `main`, and choose GitHub Actions under Pages. Then rerun the Deploy GitHub Pages workflow on `main`. The connected integration cannot change these settings (HTTP 403); no credentials are requested.
