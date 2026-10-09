# Third-party notices

PDF2Pix's original code, sample artwork and fixtures use the repository's MIT license. Third-party components retain their own copyrights and licenses. `scripts/licenses.mjs` copies installed production-package license/notice texts to `public/licenses/` during every build; deployed `licenses/index.json` identifies exact installed versions and notice filenames. Those generated copies are included in `dist/`.

| Component                     | Use                                                     | License                                                   |
| ----------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| React, React DOM, Scheduler   | Interface                                               | MIT                                                       |
| Mozilla PDF.js / pdfjs-dist   | Local PDF interpretation/rendering                      | Apache-2.0; bundled assets carry their own notices        |
| JSZip                         | Local ZIP creation                                      | MIT option of MIT/GPL-3.0 dual license                    |
| Lucide                        | Bundled icons                                           | ISC; derived Feather assets retain MIT notices            |
| JSZip transitive dependencies | Compression/streams/promises                            | Respective MIT/ISC licenses retained in generated notices |
| pdf-lib                       | Development-only deterministic sample/fixture generator | MIT                                                       |
| pngjs                         | Development-only generated raster/verification          | MIT                                                       |
| pypdf                         | Optional development-only encrypted fixture generator   | BSD-3-Clause                                              |

PDF.js's distributed `cmaps`, `standard_fonts` and `wasm` folders are copied intact, including their license files. Standard font notices and decoder notices accompany those assets. Any optional Node-native PDF.js dependencies installed by npm are not imported into the browser runtime; their installed notices are nevertheless copied for completeness.

Build/test tooling (Vite, TypeScript, Tailwind, Vitest, Playwright, axe, ESLint and related tools) remains governed by its package licenses. The lockfile records the complete dependency tree and integrity hashes. No third-party image, proprietary PDF, remotely hosted font or tracking script is part of the product.
