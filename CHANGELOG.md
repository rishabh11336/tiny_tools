# Changelog

All notable changes to tiny_tools are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Convert Image** (`/image/convert`) — PNG ↔ JPG ↔ WebP in-browser, batch,
  JPEG flattened onto white (canvas).
- **Resize Image** (`/image/resize`) — scale to any pixel size, optional
  aspect-ratio lock (canvas).
- **Split PDF** (`/pdf/split`) — keep or remove pages by range (`1-3, 5, 8-10`)
  (pdf-lib).
- **Images → PDF** (`/pdf/images-to-pdf`) — one image per page, sized to the
  image; non-JPG/PNG re-encoded to PNG via canvas (pdf-lib).
- **Optimize SVG** (`/svg/optimize`) — strip comments, editor metadata and
  whitespace, before/after size report. Regex minify, not full SVGO.

## [0.1.0] - 2026-07-19

### Added

- **Compress Image** (`/image/compress`) — shrink JPG/PNG/WebP in-browser with a
  quality slider and batch support (browser-image-compression).
- **Merge PDF** (`/pdf/merge`) — combine multiple PDFs, reorder/remove before
  merging (pdf-lib).
- **Remove PDF Password** (`/pdf/unlock`) — real client-side decryption; enter the
  password, download an unlocked PDF with text preserved (mupdf WASM, lazy-loaded).
- **QR Code Generator** (`/qr`) — live QR from any text/URL, PNG download (qrcode).
- Shared `Dropzone` and `ToolShell` components plus a tool registry (`lib/tools.ts`)
  that drives the home grid.
- Minimal design system: gradient hero, glass panels, dotted-grid backdrop,
  gradient icon tiles, light/dark tokens.
- GA4 analytics wired in the root layout.

### Notes

- Everything runs client-side — no uploads, no server compute (Vercel free tier).
- Next.js App Router; each tool is a code-split route, heavy WASM loads only on use.

[Unreleased]: https://github.com/rishabh11336/tiny_tools/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rishabh11336/tiny_tools/releases/tag/v0.1.0
