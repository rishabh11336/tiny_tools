"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const base = (n: string) => n.replace(/\.[^.]+$/, "");

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

type Scale = 2 | 4;

export default function Upscale() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState("");
  const [inDim, setInDim] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState<Scale>(2);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [outDim, setOutDim] = useState<{ w: number; h: number } | null>(null);

  async function pick(files: File[]) {
    const url = URL.createObjectURL(files[0]);
    const img = await loadImg(url);
    setFile(files[0]);
    setSrcUrl(url);
    setInDim({ w: img.naturalWidth, h: img.naturalHeight });
    setOut(null);
    setOutDim(null);
    setErr("");
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    setOut(null);
    setErr("");
    setPct(0);
    try {
      // AI super-resolution runs locally. Model + TF.js (~a few MB) download on
      // first use, then cache. Nothing is uploaded.
      await import("@tensorflow/tfjs");
      const Upscaler = (await import("upscaler")).default;
      const model = (await (scale === 4
        ? import("@upscalerjs/esrgan-medium/4x")
        : import("@upscalerjs/esrgan-medium/2x"))).default;

      const upscaler = new Upscaler({ model });
      const img = await loadImg(srcUrl);
      const result = await upscaler.upscale(img, {
        output: "base64",
        patchSize: 64, // tile big images so the tab doesn't OOM
        padding: 4, // overlap to hide tile seams
        progress: (rate: number) => setPct(Math.round(rate * 100)),
      });
      const rImg = await loadImg(result);
      setOut(result);
      setOutDim({ w: rImg.naturalWidth, h: rImg.naturalHeight });
    } catch {
      setErr("Could not upscale this image. Very large images may run out of memory — try a smaller source or 2×.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell
      title="Upscale Image"
      desc="Enlarge photos 2× or 4× with AI super-resolution — sharper than a plain resize. Runs in your browser; first use downloads a model, nothing is uploaded."
    >
      {!file && <Dropzone accept="image/*" onFiles={pick} label="Drop an image or click to browse" />}

      {file && (
        <div className="flex flex-col items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={srcUrl} alt="Source" className="max-h-64 rounded-lg border border-border" />
          {inDim && (
            <p className="text-sm text-muted">
              Source: {inDim.w}×{inDim.h}px → output ~{inDim.w * scale}×{inDim.h * scale}px
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-lg border border-border">
              {([2, 4] as Scale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  disabled={busy}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    scale === s ? "bg-accent text-white" : "text-muted hover:text-fg"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
            <button onClick={run} disabled={busy} className="btn btn-primary">
              {busy ? `Upscaling… ${pct}%` : "Upscale"}
            </button>
            <button
              onClick={() => { setFile(null); setOut(null); setErr(""); }}
              disabled={busy}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              start over
            </button>
          </div>

          {busy && <p className="text-xs text-muted">Larger images and 4× take longer — the tab may pause while tiles process.</p>}
          {err && <p className="text-sm text-red-500">{err}</p>}

          {out && (
            <div className="mt-2 flex flex-col items-start gap-3">
              {outDim && <p className="text-sm text-muted">Result: {outDim.w}×{outDim.h}px</p>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={out} alt="Upscaled" className="max-h-80 rounded-lg border border-border" />
              <a href={out} download={`${base(file.name)}-${scale}x.png`} className="btn btn-primary">↓ Download PNG</a>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}
