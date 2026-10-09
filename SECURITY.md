# Security

PDF2Pix 0.1.x is the initial development line. Keep dependencies and browsers current. CI runs an npm vulnerability audit and Dependabot proposes npm/Actions updates. Passing an audit is not proof of absence of vulnerabilities.

## Reporting

Use this repository's GitHub **Security → Report a vulnerability** feature if available. If private reporting is unavailable, contact the owner through a private contact method listed on their GitHub profile; do not post exploit details or sensitive PDFs in public issues. No guaranteed response SLA is claimed. Never include production secrets, personal documents or passwords; provide a minimal synthetic reproduction.

## Boundaries

The browser and PDF.js parse untrusted input. File extension/MIME/signature checks are usability filters, not proof a file is safe. No PDF JavaScript, URL annotations, embedded files or form actions are executed by application code. XFA is disabled. SVG exports use only a generated static wrapper and encoded PNG. Extracted text is rendered as React text or downloaded, never injected as HTML.

CSP and a static-only architecture restrict exposure, but a vulnerable PDF decoder, browser extension, compromised package/build/hosting account or OS can violate those assumptions. Rendering hostile PDFs is not risk-free. Memory caps cannot bound decompression of all embedded resources. Keep originals, inspect fidelity, and avoid unknown files on unsupported browsers.

See [privacy](PRIVACY.md) for lifecycle/storage/network details and [testing](docs/TESTING.md) for the limits of automated evidence.
