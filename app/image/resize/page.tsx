"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Src = { file: File; img: HTMLImageElement };

const base = (n: string) => n.replace(/\.[^.]+$/, "");

function load(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export default function ResizeImage() {
  const [src, setSrc] = useState<Src | null>(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(files: File[]) {
    const img = await load(files[0]);
    setSrc({ file: files[0], img });
    setW(img.naturalWidth);
    setH(img.naturalHeight);
    setUrl(null);
  }

  function setWidth(next: number) {
    setW(next);
    if (lock && src) setH(Math.round((next / src.img.naturalWidth) * src.img.naturalHeight));
    setUrl(null);
  }
  function setHeight(next: number) {
    setH(next);
    if (lock && src) setW(Math.round((next / src.img.naturalHeight) * src.img.naturalWidth));
    setUrl(null);
  }

  async function run() {
    if (!src || w < 1 || h < 1) return;
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src.img, 0, 0, w, h);
    const type = src.file.type || "image/png";
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, type, 0.92));
    if (blob) setUrl(URL.createObjectURL(blob));
    setBusy(false);
  }

  return (
    <ToolShell title="Resize Image" desc="Scale an image to any pixel size. Runs locally.">
      <Dropzone accept="image/*" onFiles={pick} label="Drop an image or click to browse" />

      {src && (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-muted">Width</span>
              <input
                type="number"
                min={1}
                value={w}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="field w-28"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Height</span>
              <input
                type="number"
                min={1}
                value={h}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="field w-28"
              />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm text-muted">
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="accent-accent" />
              lock ratio
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">
              {busy ? "Resizing…" : "Resize"}
            </button>
            {url && (
              <a href={url} download={`${base(src.file.name)}-${w}x${h}${src.file.name.match(/\.[^.]+$/)?.[0] ?? ".png"}`} className="btn btn-ghost">
                ↓ Download
              </a>
            )}
          </div>
        </>
      )}
    </ToolShell>
  );
}
