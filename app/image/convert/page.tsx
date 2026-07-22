"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Fmt = "png" | "jpeg" | "webp";
type Row = { name: string; url: string };

const mime = (f: Fmt) => `image/${f}`;
const ext = (f: Fmt) => (f === "jpeg" ? "jpg" : f);
const base = (n: string) => n.replace(/\.[^.]+$/, "");

// Load a File into an HTMLImageElement via object URL.
function load(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export default function ConvertImage() {
  const [fmt, setFmt] = useState<Fmt>("webp");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(files: File[]) {
    setBusy(true);
    const out: Row[] = [];
    for (const f of files) {
      try {
        const img = await load(f);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        // JPEG has no alpha — flatten onto white so transparency isn't black.
        if (fmt === "jpeg") {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob: Blob | null = await new Promise((r) =>
          canvas.toBlob(r, mime(fmt), 0.92),
        );
        if (blob) out.push({ name: `${base(f.name)}.${ext(fmt)}`, url: URL.createObjectURL(blob) });
      } catch {
        // skip unreadable file
      }
    }
    setRows((r) => [...out, ...r]);
    setBusy(false);
  }

  return (
    <ToolShell title="Convert Image" desc="PNG ↔ JPG ↔ WebP. Runs locally, nothing uploaded.">
      <label className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Convert to</span>
        <select
          value={fmt}
          onChange={(e) => setFmt(e.target.value as Fmt)}
          className="field w-auto"
        >
          <option value="webp">WebP</option>
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
        </select>
      </label>

      <Dropzone accept="image/*" multiple onFiles={run} label="Drop images or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Converting…</p>}

      {rows.length > 0 && (
        <ul className="mt-6 space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="card flex items-center justify-between gap-3 p-3 text-sm">
              <span className="truncate">{r.name}</span>
              <a href={r.url} download={r.name} className="btn btn-primary shrink-0 px-3 py-1.5">
                Save
              </a>
            </li>
          ))}
        </ul>
      )}
    </ToolShell>
  );
}
