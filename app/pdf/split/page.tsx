"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

// Parse "1-3,5,8-10" → zero-based indices, clamped to [0,count).
function parseRange(spec: string, count: number): number[] {
  const set = new Set<number>();
  for (const part of spec.split(",")) {
    const t = part.trim();
    if (!t) continue;
    const m = t.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let p = Math.min(a, b); p <= Math.max(a, b); p++) {
      if (p >= 1 && p <= count) set.add(p - 1);
    }
  }
  return [...set].sort((x, y) => x - y);
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [spec, setSpec] = useState("");
  const [mode, setMode] = useState<"keep" | "remove">("keep");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(files: File[]) {
    const f = files.find((x) => x.type === "application/pdf");
    if (!f) return;
    const doc = await PDFDocument.load(await f.arrayBuffer());
    setFile(f);
    setCount(doc.getPageCount());
    setSpec(`1-${doc.getPageCount()}`);
    setUrl(null);
  }

  async function run() {
    if (!file) return;
    const selected = parseRange(spec, count);
    const keep = mode === "keep" ? selected : [...Array(count).keys()].filter((i) => !selected.includes(i));
    if (keep.length === 0) return;
    setBusy(true);
    const src = await PDFDocument.load(await file.arrayBuffer());
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, keep);
    pages.forEach((p) => out.addPage(p));
    const bytes = await out.save();
    setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    setBusy(false);
  }

  return (
    <ToolShell title="Split PDF" desc="Keep or remove specific pages, then download the result. Runs locally.">
      <Dropzone accept="application/pdf" onFiles={pick} label="Drop a PDF or click to browse" />

      {file && (
        <>
          <p className="mt-5 text-sm text-muted">
            {file.name} · {count} pages
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-muted">Pages</span>
              <input
                value={spec}
                onChange={(e) => {
                  setSpec(e.target.value);
                  setUrl(null);
                }}
                placeholder="e.g. 1-3, 5, 8-10"
                className="field w-56"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Action</span>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as "keep" | "remove");
                  setUrl(null);
                }}
                className="field w-auto"
              >
                <option value="keep">Keep these pages</option>
                <option value="remove">Remove these pages</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">
              {busy ? "Working…" : "Split"}
            </button>
            {url && (
              <a href={url} download={`split-${file.name}`} className="btn btn-ghost">
                ↓ Download
              </a>
            )}
          </div>
        </>
      )}
    </ToolShell>
  );
}
