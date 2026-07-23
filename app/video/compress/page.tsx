"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";
import { transcode } from "@/lib/ffmpeg";

const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function CompressVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState(28);
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
        // Higher CRF = smaller file, lower quality. veryfast keeps wasm bearable.
        (i, o) => ["-i", i, "-vcodec", "libx264", "-crf", String(crf), "-preset", "veryfast", "-acodec", "aac", o],
        "output.mp4",
        "video/mp4",
        (r) => setPct(Math.round(r * 100)),
      );
      setUrl(out);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Compress Video" desc="Shrink a video with H.264. First use downloads a ~25MB engine; everything runs locally.">
      <Dropzone accept="video/*" onFiles={(f) => { setFile(f[0]); setUrl(null); }} label={file ? file.name : "Drop a video or click to browse"} />

      {file && (
        <>
          <label className="mt-5 flex items-center gap-3 text-sm">
            <span className="text-muted">Quality</span>
            <input type="range" min={20} max={36} value={crf} onChange={(e) => setCrf(Number(e.target.value))} className="accent-accent" />
            <span className="w-24 text-muted">CRF {crf} {crf <= 24 ? "(high)" : crf >= 32 ? "(small)" : ""}</span>
          </label>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">{busy ? `Working… ${pct}%` : "Compress"}</button>
            {url && <a href={url} download={`${base(file.name)}-compressed.mp4`} className="btn btn-ghost">↓ Download</a>}
          </div>
        </>
      )}
    </ToolShell>
  );
}
