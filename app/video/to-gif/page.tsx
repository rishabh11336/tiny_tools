"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";
import { transcode } from "@/lib/ffmpeg";

const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);
  const [maxSec, setMaxSec] = useState(10);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);

  async function run() {
    if (!file) return;
    setBusy(true);
    setUrl(null);
    setPct(0);
    try {
      const out = await transcode(
        file,
        (i, o) => ["-i", i, "-t", String(maxSec), "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`, o],
        "output.gif",
        "image/gif",
        (r) => setPct(Math.round(r * 100)),
      );
      setUrl(out);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Video → GIF" desc="Turn a clip into a GIF. First use downloads a ~25MB engine; everything runs locally.">
      <Dropzone accept="video/*" onFiles={(f) => { setFile(f[0]); setUrl(null); }} label={file ? file.name : "Drop a video or click to browse"} />

      {file && (
        <>
          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <label><span className="mb-1 block text-muted">FPS</span>
              <input type="number" min={5} max={30} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="field" /></label>
            <label><span className="mb-1 block text-muted">Width px</span>
              <input type="number" min={100} max={1000} step={20} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="field" /></label>
            <label><span className="mb-1 block text-muted">Max sec</span>
              <input type="number" min={1} max={30} value={maxSec} onChange={(e) => setMaxSec(Number(e.target.value))} className="field" /></label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">{busy ? `Working… ${pct}%` : "Make GIF"}</button>
            {url && <a href={url} download={`${base(file.name)}.gif`} className="btn btn-ghost">↓ Download</a>}
          </div>
          {url && (
            <div className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="GIF preview" className="max-h-72 rounded-lg border border-border" />
            </div>
          )}
        </>
      )}
    </ToolShell>
  );
}
