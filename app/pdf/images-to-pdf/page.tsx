"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

// Embed anything not already JPG/PNG by re-encoding to PNG via canvas.
async function toEmbeddable(file: File): Promise<{ bytes: ArrayBuffer; kind: "jpg" | "png" }> {
  if (file.type === "image/jpeg") return { bytes: await file.arrayBuffer(), kind: "jpg" };
  if (file.type === "image/png") return { bytes: await file.arrayBuffer(), kind: "png" };
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(file);
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
  return { bytes: await blob.arrayBuffer(), kind: "png" };
}

export default function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function add(list: File[]) {
    setUrl(null);
    setFiles((f) => [...f, ...list.filter((x) => x.type.startsWith("image/"))]);
  }

  async function run() {
    if (files.length === 0) return;
    setBusy(true);
    const doc = await PDFDocument.create();
    for (const f of files) {
      try {
        const { bytes, kind } = await toEmbeddable(f);
        const img = kind === "jpg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        // One page per image, sized exactly to the image.
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } catch {
        // skip unreadable image
      }
    }
    const out = await doc.save();
    setUrl(URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" })));
    setBusy(false);
  }

  return (
    <ToolShell title="Images → PDF" desc="Combine images into a PDF, one image per page. Runs locally.">
      <Dropzone accept="image/*" multiple onFiles={add} label="Drop images or click to browse" />

      {files.length > 0 && (
        <>
          <ol className="mt-6 space-y-2">
            {files.map((f, i) => (
              <li key={i} className="card flex items-center justify-between p-3 text-sm">
                <span className="truncate">
                  <span className="mr-2 text-muted tabular-nums">{i + 1}</span>
                  {f.name}
                </span>
                <button
                  onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                  className="text-muted transition-colors hover:text-fg"
                >
                  remove
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">
              {busy ? "Building…" : `Make PDF from ${files.length} image${files.length > 1 ? "s" : ""}`}
            </button>
            <button onClick={() => setFiles([])} className="text-sm text-muted transition-colors hover:text-fg">
              clear
            </button>
          </div>
        </>
      )}

      {url && (
        <a href={url} download="images.pdf" className="btn btn-ghost mt-5">
          ↓ Download images.pdf
        </a>
      )}
    </ToolShell>
  );
}
