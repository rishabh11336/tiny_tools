"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Img = { page: number; url: string };
const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function PdfToImages() {
  const [name, setName] = useState("");
  const [scale, setScale] = useState(2);
  const [imgs, setImgs] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(files: File[]) {
    const f = files.find((x) => x.type === "application/pdf");
    if (!f) return;
    setBusy(true);
    setImgs([]);
    setName(f.name);
    try {
      const mupdf = await import("mupdf");
      const doc = mupdf.Document.openDocument(await f.arrayBuffer(), "application/pdf");
      const out: Img[] = [];
      for (let i = 0; i < doc.countPages(); i++) {
        const page = doc.loadPage(i);
        const pix = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false);
        const png = pix.asPNG();
        out.push({ page: i + 1, url: URL.createObjectURL(new Blob([png as BlobPart], { type: "image/png" })) });
      }
      setImgs(out);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="PDF → Images" desc="Render each PDF page to a PNG. Runs locally, nothing uploaded.">
      <label className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Quality</span>
        <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="field w-auto">
          <option value={1}>1× (72 dpi)</option>
          <option value={2}>2× (144 dpi)</option>
          <option value={3}>3× (216 dpi)</option>
        </select>
      </label>

      <Dropzone accept="application/pdf" onFiles={run} label="Drop a PDF or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Rendering…</p>}

      {imgs.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {imgs.map((im) => (
            <div key={im.page} className="card overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={`Page ${im.page}`} className="w-full rounded border border-border bg-white" />
              <a
                href={im.url}
                download={`${base(name)}-p${im.page}.png`}
                className="btn btn-ghost mt-2 w-full justify-center py-1.5 text-xs"
              >
                ↓ Page {im.page}
              </a>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}
