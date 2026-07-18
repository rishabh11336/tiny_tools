"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  function add(list: File[]) {
    setUrl(null);
    setFiles((f) => [...f, ...list.filter((x) => x.type === "application/pdf")]);
  }

  async function merge() {
    if (files.length < 2) return;
    setBusy(true);
    const out = await PDFDocument.create();
    for (const f of files) {
      const src = await PDFDocument.load(await f.arrayBuffer());
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    }
    const bytes = await out.save();
    setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    setBusy(false);
  }

  return (
    <ToolShell title="Merge PDF" desc="Combine multiple PDFs into one. Order = the order you add them.">
      <Dropzone accept="application/pdf" multiple onFiles={add} label="Drop PDFs or click to browse" />

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
            <button
              onClick={merge}
              disabled={files.length < 2 || busy}
              className="btn btn-primary"
            >
              {busy ? "Merging…" : `Merge ${files.length} PDFs`}
            </button>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              clear
            </button>
          </div>
        </>
      )}

      {url && (
        <a href={url} download="merged.pdf" className="btn btn-ghost mt-5">
          ↓ Download merged.pdf
        </a>
      )}
    </ToolShell>
  );
}
