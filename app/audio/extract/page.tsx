"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";
import { transcode } from "@/lib/ffmpeg";

const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function ExtractAudio() {
  const [file, setFile] = useState<File | null>(null);
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
        (i, o) => ["-i", i, "-vn", "-acodec", "libmp3lame", "-q:a", "2", o],
        "output.mp3",
        "audio/mpeg",
        (r) => setPct(Math.round(r * 100)),
      );
      setUrl(out);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Extract Audio" desc="Pull the audio out of a video as MP3. First use downloads a ~25MB engine; everything runs locally.">
      <Dropzone accept="video/*" onFiles={(f) => { setFile(f[0]); setUrl(null); }} label={file ? file.name : "Drop a video or click to browse"} />

      {file && (
        <div className="mt-5 flex items-center gap-3">
          <button onClick={run} disabled={busy} className="btn btn-primary">
            {busy ? `Working… ${pct}%` : "Extract MP3"}
          </button>
          {url && <a href={url} download={`${base(file.name)}.mp3`} className="btn btn-ghost">↓ Download</a>}
        </div>
      )}
    </ToolShell>
  );
}
