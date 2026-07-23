"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function RemoveBg() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");

  async function run(files: File[]) {
    setBusy(true);
    setUrl(null);
    setErr("");
    setPct(0);
    setName(files[0].name);
    try {
      // Model (~tens of MB) downloads on first use, then caches. Inference is local.
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(files[0], {
        progress: (_key, current, total) => setPct(total ? Math.round((current / total) * 100) : 0),
      });
      setUrl(URL.createObjectURL(blob));
    } catch {
      setErr("Could not process this image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title="Remove Background" desc="Erase an image background in your browser. First use downloads a model; nothing is uploaded.">
      <Dropzone accept="image/*" onFiles={run} label="Drop an image or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Working… {pct}%</p>}
      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}

      {url && (
        <div className="mt-6 flex flex-col items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Result"
            className="max-h-80 rounded-lg border border-border"
            style={{ backgroundImage: "repeating-conic-gradient(#ccc 0 25%, transparent 0 50%)", backgroundSize: "20px 20px" }}
          />
          <a href={url} download={`${base(name)}-no-bg.png`} className="btn btn-primary">↓ Download PNG</a>
        </div>
      )}
    </ToolShell>
  );
}
