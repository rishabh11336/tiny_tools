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
- **Crop / Rotate / Flip Image** (`/image/crop`, `/image/rotate`) — drag-select
  crop and 90°/mirror transforms (canvas).
- **Color Palette** (`/image/palette`) — extract dominant colors, click to copy.
- **Strip EXIF** (`/image/exif`) — remove camera/GPS/timestamp metadata by
  re-encoding (canvas).
- **Favicon Generator** (`/image/favicon`) — multi-size `favicon.ico` (16/32/48),
  hand-packed ICO.
- **Remove Background** (`/image/remove-bg`) — in-browser matting
  (`@imgly/background-removal`, model lazy-loaded on first use).
- **PDF → Images** (`/pdf/to-images`) and **Extract PDF Text**
  (`/pdf/extract-text`) — render pages to PNG / pull selectable text (mupdf).
- **Rotate PDF** (`/pdf/rotate`) — 90/180/270° (pdf-lib).
- **Compress PDF** (`/pdf/compress`) — GC unused objects + compress streams
  (mupdf); keeps the original if already optimized.
- **Text utilities** — Hash (`/text/hash`, SubtleCrypto), Base64 (`/text/base64`),
  URL encode (`/text/url`), JSON formatter (`/text/json`), UUID (`/text/uuid`),
  Password (`/text/password`), Word/Char counter (`/text/count`), Case converter
  (`/text/case`). Pure browser APIs, no deps.
- **QR Reader** (`/qr/read`) — decode a QR from an image (native `BarcodeDetector`).
- **Audio: Extract / Convert** (`/audio/extract`, `/audio/convert`) and
  **Video: → GIF / Trim / Compress** (`/video/to-gif`, `/video/trim`,
  `/video/compress`) — `ffmpeg.wasm` single-threaded core, lazy-loaded from CDN
  on first use (no COOP/COEP headers, GA4 untouched).

### Notes

- Two new heavy deps are lazy-loaded per-tool only: `ffmpeg.wasm` (audio/video)
  and `@imgly/background-removal` (remove-bg). The home page and all other tools
  stay light. Processing remains fully client-side.

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
