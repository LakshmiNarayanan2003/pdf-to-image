# Contributing

Use Node 24.19.0, npm and the committed lockfile. Run `npm ci`, `npm run dev`, `npm run check`, `npm audit --audit-level=moderate` and `npm run test:e2e` (install Playwright engines first). See [testing](docs/TESTING.md).

Keep modules small and typed. Preserve byte-based local processing, bundled runtime assets, honest format labels, cancellation and cleanup. Use semantic controls, visible focus and readable contrast. Do not introduce analytics, persistence of document data, remote runtime imports or arbitrary URL loading.

Use only public/synthetic fixtures and original/permissively licensed assets. Never include private documents, passwords, metadata dumps or secrets. Add meaningful tests for changed behavior, inspect UI on mobile/dark mode, and explain output/fidelity effects in the PR.

Update CHANGELOG and relevant docs to describe shipped behavior. Use conventional commit messages. Open an issue for substantial feature proposals. Security reports follow [SECURITY.md](SECURITY.md). All contributions are under the existing MIT license and [code of conduct](CODE_OF_CONDUCT.md).
