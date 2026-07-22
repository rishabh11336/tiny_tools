"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

// Downscale, bucket colors to a coarse grid, return the most frequent N.
async function extract(file: File, n = 8): Promise<string[]> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(file);
  });
  const w = 120;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const counts = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent
    const r = data[i] & 0xf0, g = data[i + 1] & 0xf0, b = data[i + 2] & 0xf0;
    const key = `${r},${g},${b}`;
    const c = counts.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    c.n++; c.r += data[i]; c.g += data[i + 1]; c.b += data[i + 2];
    counts.set(key, c);
  }
  return [...counts.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, n)
    .map((c) => hex(Math.round(c.r / c.n), Math.round(c.g / c.n), Math.round(c.b / c.n)));
}

export default function PaletteTool() {
  const [colors, setColors] = useState<string[]>([]);

  return (
    <ToolShell title="Color Palette" desc="Extract the dominant colors from an image. Runs locally.">
      <Dropzone accept="image/*" onFiles={async (f) => setColors(await extract(f[0]))} label="Drop an image or click to browse" />

      {colors.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => navigator.clipboard.writeText(c)}
              title="Click to copy"
              className="card overflow-hidden p-0 text-left"
            >
              <span className="block h-16" style={{ background: c }} />
              <span className="block p-2 text-center text-xs tabular-nums">{c}</span>
            </button>
          ))}
        </div>
      )}
    </ToolShell>
  );
}
