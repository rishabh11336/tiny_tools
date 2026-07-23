"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";
import { transcode } from "@/lib/ffmpeg";

const ext = (n: string) => n.match(/\.[^.]+$/)?.[0] ?? ".mp4";
const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function TrimVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState("00:00");
  const [dur, setDur] = useState("00:10");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);

  async function run() {
    if (!file) return;
    setBusy(true);
    setUrl(null);
    setPct(0);
    try {
      const outExt = ext(file.name);
      const out = await transcode(
        file,
        // Stream-copy for a fast, lossless cut (snaps to nearest keyframe).
        (i, o) => ["-ss", start, "-i", i, "-t", dur, "-c", "copy", o],
        "output" + outExt,
        file.type || "video/mp4",
        (r) => setPct(Math.round(r * 100)),
      );
      setUrl(out);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Trim Video" desc="Cut a clip to a start + length. First use downloads a ~25MB engine; everything runs locally.">
      <Dropzone accept="video/*" onFiles={(f) => { setFile(f[0]); setUrl(null); }} label={file ? file.name : "Drop a video or click to browse"} />

      {file && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <label><span className="mb-1 block text-muted">Start (mm:ss)</span>
              <input value={start} onChange={(e) => setStart(e.target.value)} className="field" /></label>
            <label><span className="mb-1 block text-muted">Length (mm:ss)</span>
              <input value={dur} onChange={(e) => setDur(e.target.value)} className="field" /></label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">{busy ? `Working… ${pct}%` : "Trim"}</button>
            {url && <a href={url} download={`${base(file.name)}-clip${ext(file.name)}`} className="btn btn-ghost">↓ Download</a>}
          </div>
        </>
      )}
    </ToolShell>
  );
}
