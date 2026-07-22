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
];

export const groups = ["Image", "PDF", "SVG", "Audio", "Video", "Utility"] as const;
