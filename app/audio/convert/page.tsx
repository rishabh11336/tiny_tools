"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";
import { transcode } from "@/lib/ffmpeg";

type Fmt = "mp3" | "wav" | "ogg";
const base = (n: string) => n.replace(/\.[^.]+$/, "");
const CODEC: Record<Fmt, string[]> = {
  mp3: ["-acodec", "libmp3lame", "-q:a", "2"],
  wav: ["-acodec", "pcm_s16le"],
  ogg: ["-acodec", "libvorbis", "-q:a", "5"],
};
const MIME: Record<Fmt, string> = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg" };

export default function ConvertAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [fmt, setFmt] = useState<Fmt>("mp3");
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
        (i, o) => ["-i", i, ...CODEC[fmt], o],
        `output.${fmt}`,
        MIME[fmt],
        (r) => setPct(Math.round(r * 100)),
      );
      setUrl(out);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Convert Audio" desc="MP3 / WAV / OGG. First use downloads a ~25MB engine; everything runs locally.">
      <label className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Convert to</span>
        <select value={fmt} onChange={(e) => { setFmt(e.target.value as Fmt); setUrl(null); }} className="field w-auto">
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
          <option value="ogg">OGG</option>
        </select>
      </label>

      <Dropzone accept="audio/*,video/*" onFiles={(f) => { setFile(f[0]); setUrl(null); }} label={file ? file.name : "Drop an audio file or click to browse"} />

      {file && (
        <div className="mt-5 flex items-center gap-3">
          <button onClick={run} disabled={busy} className="btn btn-primary">
            {busy ? `Working… ${pct}%` : `Convert to ${fmt.toUpperCase()}`}
          </button>
          {url && <a href={url} download={`${base(file.name)}.${fmt}`} className="btn btn-ghost">↓ Download</a>}
        </div>
      )}
    </ToolShell>
  );
}
