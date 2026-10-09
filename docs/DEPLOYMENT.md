# GitHub Pages deployment

Repository: `LakshmiNarayanan2003/pdf-to-image`. Canonical project URL: `https://lakshminarayanan2003.github.io/pdf-to-image/`.

1. Push the verified history to `master` without force pushing.
2. In repository Settings → Pages, choose **GitHub Actions** as the build source.
3. A push to `master`, or a manual dispatch on `master`, runs `deploy.yml`. Its reusable CI workflow installs from the lockfile, performs all quality/security/browser checks, and uploads a verified site artifact.
4. Only after checks succeed does the deployment job download that exact artifact, configure Pages, upload the Pages artifact and deploy it with GitHub's built-in OIDC/token permissions.
5. Observe the workflow result and open the actual deployed subpath. Click Try sample PDF and verify a multi-page export before claiming publication works.

PR workflows have read-only contents permissions and cannot run the deployment job. The deployment job has only `contents: read`, `pages: write` and `id-token: write`, uses the `github-pages` environment and serialized concurrency. No personal access token or repository secret is needed for ordinary Pages deployment. Existing environment protections still apply.

The repository is public, uses `master` as its default and deployment branch, and has Pages configured to use GitHub Actions. Consult [verification](VERIFICATION.md) for the precise observed state. Local build success is not evidence of a remote green workflow or public deployment.

## Base path

The default Vite base is `/pdf-to-image/`. All app runtime assets and the sample use Vite's base, including worker and auxiliary files. `/pdf2pix/` is supported via `VITE_BASE_PATH` for testing/another deployment, but changing that variable cannot rename this repository's project-site URL. Static canonical, OG and sitemap URLs intentionally identify the preferred actual target.

Deploy the whole `dist/` directory. Worker modules, CMaps, standard fonts, WASM and license notices must travel with the app. No custom domain is configured.

## Cloud setup

The workspace is already isolated; use its existing checkout. Do not create worktrees unless explicitly requested. `npm ci` installs dependencies; `npm run build` prepares the static site and local asset/license copies. Runtime dev/preview processes must be restarted in later tasks. For a production smoke test, start `npm run preview -- --host 0.0.0.0 --port 4173 --strictPort` from the repository and run a representative Playwright test.

Required external hosts during development include npm's registry and Playwright's official download hosts. GitHub API access is separately required to inspect/configure Pages; native Git access may work even when API access is denied. Do not extract proxy credentials or disable security verification to work around a policy.
