"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  function add(list: File[]) {
    setUrl(null);
    setFiles((f) => [...f, ...list.filter((x) => x.type === "application/pdf")]);
  }

  // Reorder via native drag: merged output follows list order.
  function drop(to: number) {
    setFiles((arr) => {
      if (drag === null || drag === to) return arr;
      const next = [...arr];
      const [m] = next.splice(drag, 1);
      next.splice(to, 0, m);
      return next;
    });
    setDrag(null);
    setUrl(null);
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
    <ToolShell title="Merge PDF" desc="Combine multiple PDFs into one. Drag to reorder before merging.">
      <Dropzone accept="application/pdf" multiple onFiles={add} label="Drop PDFs or click to browse" />

      {files.length > 0 && (
        <>
          <ol className="mt-6 space-y-2">
            {files.map((f, i) => (
              <li
                key={i}
                draggable
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(i)}
                className={`card flex items-center justify-between p-3 text-sm ${
                  drag === i ? "opacity-40" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="cursor-grab text-muted active:cursor-grabbing" aria-hidden>⠿</span>
                  <span className="text-muted tabular-nums">{i + 1}</span>
                  <span className="truncate">{f.name}</span>
                </span>
                <button
                  onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                  className="ml-3 shrink-0 text-muted transition-colors hover:text-fg"
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
