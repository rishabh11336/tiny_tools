"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;

export default function CompressPdf() {
  const [name, setName] = useState("");
  const [before, setBefore] = useState(0);
  const [after, setAfter] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function run(files: File[]) {
    const f = files.find((x) => x.type === "application/pdf");
    if (!f) return;
    setBusy(true);
    setUrl(null);
    setNote("");
    try {
      const mupdf = await import("mupdf");
      const buf = new Uint8Array(await f.arrayBuffer());
      const pdf = mupdf.Document.openDocument(buf, "application/pdf").asPDF();
      if (!pdf) { setNote("Not a valid PDF."); return; }
      // ponytail: GC unused objects + compress streams/fonts/images. Real image
      // downsampling would need per-page re-render; add that if users need more.
      const out = pdf.saveToBuffer("compress,compress-images,compress-fonts,garbage=compact").asUint8Array();
      // Rewriting can enlarge already-optimized PDFs — keep whichever is smaller.
      const best = out.length < buf.length ? out : buf;
      setName(f.name);
      setBefore(buf.length);
      setAfter(best.length);
      if (best === buf) setNote("Already well-optimized — original kept.");
      setUrl(URL.createObjectURL(new Blob([best as BlobPart], { type: "application/pdf" })));
    } finally {
      setBusy(false);
    }
  }

  const pct = before ? Math.round((1 - after / before) * 100) : 0;

  return (
    <ToolShell title="Compress PDF" desc="Strip unused objects and compress streams. Runs locally.">
      <Dropzone accept="application/pdf" onFiles={run} label="Drop a PDF or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Compressing…</p>}

      {url && (
        <div className="mt-6">
          <div className="card flex items-center justify-between gap-3 p-3 text-sm">
            <span className="truncate">{name}</span>
            <span className="shrink-0 text-muted">
              {kb(before)} → {kb(after)}{" "}
              <span className="text-emerald-600 dark:text-emerald-400">−{pct}%</span>
            </span>
          </div>
          {note && <p className="mt-2 text-xs text-muted">{note}</p>}
          <a href={url} download={`compressed-${name}`} className="btn btn-primary mt-4">↓ Download</a>
        </div>
      )}
    </ToolShell>
  );
}
