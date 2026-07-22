"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const SIZES = [16, 32, 48];

function load(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(file);
  });
}

function pngAt(img: HTMLImageElement, size: number): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(img, 0, 0, size, size);
  return new Promise((res) => canvas.toBlob(async (b) => res(new Uint8Array(await b!.arrayBuffer())), "image/png"));
}

// Pack PNG-encoded icons into a single .ico (modern ICO allows PNG payloads).
function packIco(icons: { size: number; bytes: Uint8Array }[]): Uint8Array {
  const n = icons.length;
  const dir = 6 + 16 * n;
  const total = dir + icons.reduce((s, i) => s + i.bytes.length, 0);
  const buf = new Uint8Array(total);
  const dv = new DataView(buf.buffer);
  dv.setUint16(4, n, true); // reserved=0, type=1(default 0→set), count
  dv.setUint16(2, 1, true);
  let off = dir;
  icons.forEach((ic, i) => {
    const e = 6 + 16 * i;
    buf[e] = ic.size >= 256 ? 0 : ic.size;
    buf[e + 1] = ic.size >= 256 ? 0 : ic.size;
    dv.setUint16(e + 4, 1, true); // planes
    dv.setUint16(e + 6, 32, true); // bit depth
    dv.setUint32(e + 8, ic.bytes.length, true);
    dv.setUint32(e + 12, off, true);
    buf.set(ic.bytes, off);
    off += ic.bytes.length;
  });
  return buf;
}

export default function FaviconTool() {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(files: File[]) {
    setBusy(true);
    setUrl(null);
    try {
      const img = await load(files[0]);
      const icons = await Promise.all(SIZES.map(async (s) => ({ size: s, bytes: await pngAt(img, s) })));
      const ico = packIco(icons);
      setUrl(URL.createObjectURL(new Blob([ico as BlobPart], { type: "image/x-icon" })));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Favicon Generator" desc="Build a multi-size favicon.ico (16/32/48) from any image. Runs locally.">
      <Dropzone accept="image/*" onFiles={run} label="Drop a square image or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Building…</p>}

      {url && (
        <div className="mt-6 flex flex-col items-start gap-3">
          <p className="text-sm text-muted">favicon.ico · {SIZES.join(" / ")} px</p>
          <a href={url} download="favicon.ico" className="btn btn-primary">↓ Download favicon.ico</a>
        </div>
      )}
    </ToolShell>
  );
}
