"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Src = { file: File; img: HTMLImageElement };
const base = (n: string) => n.replace(/\.[^.]+$/, "");
const ext = (n: string) => n.match(/\.[^.]+$/)?.[0] ?? ".png";

function load(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// Render source with a rotation (deg) and optional flips onto a canvas → blob url.
async function render(src: Src, rot: number, flipH: boolean, flipV: boolean): Promise<string> {
  const { img } = src;
  const swap = rot === 90 || rot === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? img.naturalHeight : img.naturalWidth;
  canvas.height = swap ? img.naturalWidth : img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  const type = src.file.type || "image/png";
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), type, 0.92));
  return URL.createObjectURL(blob);
}

export default function RotateImage() {
  const [src, setSrc] = useState<Src | null>(null);
  const [rot, setRot] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(files: File[]) {
    setSrc({ file: files[0], img: await load(files[0]) });
    setRot(0);
    setFlipH(false);
    setFlipV(false);
    setUrl(null);
  }

  async function apply(next: { rot?: number; flipH?: boolean; flipV?: boolean }) {
    if (!src) return;
    const r = next.rot ?? rot;
    const h = next.flipH ?? flipH;
    const v = next.flipV ?? flipV;
    setRot(r);
    setFlipH(h);
    setFlipV(v);
    setBusy(true);
    setUrl(await render(src, r, h, v));
    setBusy(false);
  }

  return (
    <ToolShell title="Rotate / Flip Image" desc="Turn or mirror an image. Runs locally.">
      <Dropzone accept="image/*" onFiles={pick} label="Drop an image or click to browse" />

      {src && (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => apply({ rot: (rot + 270) % 360 })} className="btn btn-ghost px-3 py-1.5">↺ Left</button>
            <button onClick={() => apply({ rot: (rot + 90) % 360 })} className="btn btn-ghost px-3 py-1.5">↻ Right</button>
            <button onClick={() => apply({ flipH: !flipH })} className="btn btn-ghost px-3 py-1.5">⇋ Flip H</button>
            <button onClick={() => apply({ flipV: !flipV })} className="btn btn-ghost px-3 py-1.5">⇅ Flip V</button>
          </div>
          {busy && <p className="mt-4 text-sm text-muted">Rendering…</p>}
          {url && (
            <div className="mt-5 flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Result" className="max-h-80 rounded-xl border border-border" />
              <a href={url} download={`${base(src.file.name)}-edited${ext(src.file.name)}`} className="btn btn-primary">
                ↓ Download
              </a>
            </div>
          )}
        </>
      )}
    </ToolShell>
  );
}
