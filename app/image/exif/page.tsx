"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Res = { name: string; before: number; after: number; url: string };
const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;

// Re-encoding through a canvas drops all EXIF/metadata — the pixels survive,
// GPS/camera/timestamp tags do not.
async function strip(file: File): Promise<Res> {
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
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), type, 0.95));
  return { name: file.name, before: file.size, after: blob.size, url: URL.createObjectURL(blob) };
}

export default function ExifTool() {
  const [rows, setRows] = useState<Res[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(files: File[]) {
    setBusy(true);
    const out: Res[] = [];
    for (const f of files) {
      try { out.push(await strip(f)); } catch { /* skip */ }
    }
    setRows((r) => [...out, ...r]);
    setBusy(false);
  }

  return (
    <ToolShell title="Strip EXIF" desc="Remove camera, GPS and timestamp metadata by re-encoding. Runs locally.">
      <Dropzone accept="image/jpeg,image/png" multiple onFiles={run} label="Drop JPG/PNG or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Cleaning…</p>}

      {rows.length > 0 && (
        <ul className="mt-6 space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="card flex items-center justify-between gap-3 p-3 text-sm">
              <span className="truncate">{r.name}</span>
              <span className="shrink-0 text-muted">{kb(r.before)} → {kb(r.after)}</span>
              <a href={r.url} download={`clean-${r.name}`} className="btn btn-primary shrink-0 px-3 py-1.5">Save</a>
            </li>
          ))}
        </ul>
      )}
    </ToolShell>
  );
}
