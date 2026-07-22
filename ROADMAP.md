# Roadmap

Planned tools and features. **Everything runs client-side** — no uploads, no
server compute. Placeholders live in `lib/tools.ts` as `ready: false` (shown as
"soon" on the home grid); flip to `true` when the route ships.

## Phase A — next up (zero / near-zero new deps)

| Tool | Group | Tech |
|------|-------|------|
| PDF → Images | PDF | `mupdf` (installed) render pages → PNG |
| Rotate PDF | PDF | pdf-lib `setRotation` |
| Extract PDF Text | PDF | mupdf structured text |
| Crop Image | Image | canvas + drag rect |
| Rotate / Flip Image | Image | canvas transform |

**Utility cluster** (pure JS, tiny, high organic-search value):
Hash (`crypto.subtle`), Base64, URL encode, JSON formatter, UUID
(`crypto.randomUUID`), Password (`crypto.getRandomValues`), Word/Char counter,
Case converter.

## Phase B — one small dep each

| Tool | Dep |
|------|-----|
| QR Reader | native `BarcodeDetector`, `jsQR` fallback |
| Compress PDF | mupdf (installed) |
| Favicon Generator | canvas + ICO packing |
| Strip EXIF | canvas re-encode (`exifr` to view) |
| Color Palette | canvas sampling |
| Batch ZIP download (app-wide) | `fflate` (~8KB) |

## Phase C — heavy WASM, lazy-load only

Loaded on tool open (like `pdf/unlock` does with mupdf today). Activates the
**Audio** and **Video** groups.

| Tool | Dep |
|------|-----|
| Video → GIF · Trim · Compress · Extract Audio · Convert Audio | `ffmpeg.wasm` (~30MB, one dep → whole category) |
| Remove Background | `@imgly/background-removal` (onnx wasm) |

## App-level features

- Home search / filter
- Favorites + recent (`localStorage`)
- Drag-reorder for Merge PDF & Images → PDF (native HTML5 DnD)
- PWA + offline (manifest + service worker — on-brand: works with no network)
- Per-tool SEO: `metadata` export per route, OG images, `sitemap.ts`, `robots.ts`

## Constraint

`<strict>` Every tool processes entirely in the browser. Heavy WASM is
lazy-loaded per-tool, never on the home page.
