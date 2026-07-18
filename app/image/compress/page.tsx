"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Row = { name: string; before: number; after: number; url: string };

const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;

export default function CompressImage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [quality, setQuality] = useState(0.7);

  async function run(files: File[]) {
    setBusy(true);
    const out: Row[] = [];
    for (const f of files) {
      try {
        const c = await imageCompression(f, {
          maxSizeMB: 10,
          maxWidthOrHeight: 4096,
          initialQuality: quality,
          useWebWorker: true,
        });
        out.push({ name: f.name, before: f.size, after: c.size, url: URL.createObjectURL(c) });
      } catch {
        // skip unreadable file
      }
    }
    setRows((r) => [...out, ...r]);
    setBusy(false);
  }

  return (
    <ToolShell title="Compress Image" desc="Reduce JPG / PNG / WebP file size. Runs locally.">
      <label className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Quality</span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="accent-accent"
        />
        <span className="w-10 tabular-nums text-muted">{Math.round(quality * 100)}%</span>
      </label>

      <Dropzone accept="image/*" multiple onFiles={run} label="Drop images or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Compressing…</p>}

      {rows.length > 0 && (
        <ul className="mt-6 space-y-2">
          {rows.map((r, i) => {
            const pct = r.before ? Math.round((1 - r.after / r.before) * 100) : 0;
            return (
              <li
                key={i}
                className="card flex items-center justify-between gap-3 p-3 text-sm"
              >
                <span className="truncate">{r.name}</span>
                <span className="shrink-0 text-muted">
                  {kb(r.before)} → {kb(r.after)}{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">−{pct}%</span>
                </span>
                <a
                  href={r.url}
                  download={`compressed-${r.name}`}
                  className="btn btn-primary shrink-0 px-3 py-1.5"
                >
                  Save
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </ToolShell>
  );
}
