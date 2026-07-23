"use client";
import { useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

type Rect = { x: number; y: number; w: number; h: number };
const base = (n: string) => n.replace(/\.[^.]+$/, "");
const ext = (n: string) => n.match(/\.[^.]+$/)?.[0] ?? ".png";

export default function CropImage() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [rect, setRect] = useState<Rect | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  function pick(files: File[]) {
    setFile(files[0]);
    setImgUrl(URL.createObjectURL(files[0]));
    setRect(null);
    setOut(null);
  }

  // Pointer position relative to the displayed image, clamped to its box.
  function rel(e: React.PointerEvent) {
    const r = imgRef.current!.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - r.left, 0), r.width),
      y: Math.min(Math.max(e.clientY - r.top, 0), r.height),
    };
  }

  function down(e: React.PointerEvent) {
    e.preventDefault();
    drag.current = rel(e);
    setRect({ ...drag.current, w: 0, h: 0 });
    setOut(null);
  }
  function move(e: React.PointerEvent) {
    if (!drag.current) return;
    const p = rel(e);
    const s = drag.current;
    setRect({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  }
  function up() {
    drag.current = null;
  }

  async function crop() {
    const img = imgRef.current;
    if (!img || !file || !rect || rect.w < 2 || rect.h < 2) return;
    const sx = img.naturalWidth / img.clientWidth;
    const sy = img.naturalHeight / img.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.w * sx);
    canvas.height = Math.round(rect.h * sy);
    canvas
      .getContext("2d")!
      .drawImage(img, rect.x * sx, rect.y * sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    const type = file.type || "image/png";
    const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), type, 0.92));
    setOut(URL.createObjectURL(blob));
  }

  return (
    <ToolShell title="Crop Image" desc="Drag a box over the image to crop it. Runs locally.">
      {!file && <Dropzone accept="image/*" onFiles={pick} label="Drop an image or click to browse" />}

      {file && (
        <>
          <div className="relative inline-block touch-none select-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={imgUrl} alt="Source" draggable={false} className="block max-h-[70vh] max-w-full rounded-lg border border-border" />
            {rect && rect.w > 0 && (
              <div
                className="pointer-events-none absolute border-2 border-accent bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              />
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={crop} disabled={!rect || rect.w < 2} className="btn btn-primary">Crop</button>
            <button onClick={() => { setFile(null); setRect(null); setOut(null); }} className="text-sm text-muted transition-colors hover:text-fg">
              start over
            </button>
          </div>

          {out && (
            <div className="mt-5 flex flex-col items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={out} alt="Cropped" className="max-h-72 rounded-lg border border-border" />
              <a href={out} download={`${base(file.name)}-cropped${ext(file.name)}`} className="btn btn-ghost">↓ Download</a>
            </div>
          )}
        </>
      )}
    </ToolShell>
  );
}
