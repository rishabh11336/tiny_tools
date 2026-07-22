// Tool registry — single source of truth for home grid, routing labels, SEO.
export type Tool = {
  slug: string; // route path under /
  name: string;
  desc: string;
  group: "PDF" | "Image" | "SVG" | "Audio" | "Video" | "Utility";
  ready: boolean; // built vs planned
};

export const tools: Tool[] = [
  { slug: "image/compress", name: "Compress Image", desc: "Shrink JP/PNG/WebP file size in-browser.", group: "Image", ready: true },
  { slug: "pdf/merge", name: "Merge PDF", desc: "Combine multiple PDFs into one.", group: "PDF", ready: true },
  { slug: "pdf/unlock", name: "Remove PDF Password", desc: "Enter the password, download an unlocked PDF.", group: "PDF", ready: true },
  { slug: "qr", name: "QR Code Generator", desc: "Make a QR code from any text or URL.", group: "Utility", ready: true },

  { slug: "image/convert", name: "Convert Image", desc: "PNG ↔ JPG ↔ WebP.", group: "Image", ready: true },
  { slug: "image/resize", name: "Resize Image", desc: "Scale images to any dimension.", group: "Image", ready: true },
  { slug: "pdf/split", name: "Split PDF", desc: "Extract or delete pages.", group: "PDF", ready: true },
  { slug: "pdf/images-to-pdf", name: "Images → PDF", desc: "Turn images into a PDF.", group: "PDF", ready: true },
  { slug: "svg/optimize", name: "Optimize SVG", desc: "Strip comments, metadata & whitespace.", group: "SVG", ready: true },

  // Planned — see ROADMAP.md. All client-side.
  // Image
  { slug: "image/crop", name: "Crop Image", desc: "Trim to a selected area.", group: "Image", ready: true },
  { slug: "image/rotate", name: "Rotate / Flip Image", desc: "Turn or mirror an image.", group: "Image", ready: true },
  { slug: "image/remove-bg", name: "Remove Background", desc: "Erase the background in-browser.", group: "Image", ready: false },
  { slug: "image/palette", name: "Color Palette", desc: "Extract dominant colors.", group: "Image", ready: false },
  { slug: "image/exif", name: "Strip EXIF", desc: "Remove metadata for privacy.", group: "Image", ready: false },
  { slug: "image/favicon", name: "Favicon Generator", desc: "Build a multi-size .ico.", group: "Image", ready: false },
  // PDF
  { slug: "pdf/to-images", name: "PDF → Images", desc: "Render pages to PNG.", group: "PDF", ready: true },
  { slug: "pdf/rotate", name: "Rotate PDF", desc: "Turn pages 90/180/270°.", group: "PDF", ready: true },
  { slug: "pdf/extract-text", name: "Extract PDF Text", desc: "Pull plain text from a PDF.", group: "PDF", ready: true },
  { slug: "pdf/compress", name: "Compress PDF", desc: "Shrink PDF file size.", group: "PDF", ready: false },
  // Utility
  { slug: "text/hash", name: "Hash Generator", desc: "SHA-1 / 256 / 512 of any text.", group: "Utility", ready: true },
  { slug: "text/base64", name: "Base64 Encode/Decode", desc: "Text ↔ Base64.", group: "Utility", ready: true },
  { slug: "text/url", name: "URL Encode/Decode", desc: "Escape or unescape URLs.", group: "Utility", ready: true },
  { slug: "text/json", name: "JSON Formatter", desc: "Pretty-print & validate JSON.", group: "Utility", ready: true },
  { slug: "text/uuid", name: "UUID Generator", desc: "Random v4 UUIDs.", group: "Utility", ready: true },
  { slug: "text/password", name: "Password Generator", desc: "Strong random passwords.", group: "Utility", ready: true },
  { slug: "text/count", name: "Word & Char Counter", desc: "Count words, characters, lines.", group: "Utility", ready: true },
  { slug: "text/case", name: "Case Converter", desc: "UPPER / lower / Title / camel.", group: "Utility", ready: true },
  { slug: "qr/read", name: "QR Reader", desc: "Scan a QR code from an image.", group: "Utility", ready: false },
  // Audio / Video (ffmpeg.wasm, lazy-loaded)
  { slug: "audio/extract", name: "Extract Audio", desc: "Pull audio out of a video.", group: "Audio", ready: false },
  { slug: "audio/convert", name: "Convert Audio", desc: "MP3 / WAV / OGG.", group: "Audio", ready: false },
  { slug: "video/to-gif", name: "Video → GIF", desc: "Turn a clip into a GIF.", group: "Video", ready: false },
  { slug: "video/trim", name: "Trim Video", desc: "Cut a clip to a range.", group: "Video", ready: false },
  { slug: "video/compress", name: "Compress Video", desc: "Shrink video file size.", group: "Video", ready: false },
];

export const groups = ["Image", "PDF", "SVG", "Audio", "Video", "Utility"] as const;
