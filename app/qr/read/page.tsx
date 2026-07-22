"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

// ponytail: native BarcodeDetector, no dep. Chrome/Edge/Android support it;
// Safari/Firefox don't yet. Add `jsQR` as a fallback if that coverage matters.
type BD = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type BDCtor = new (o?: { formats: string[] }) => BD;

export default function QrReader() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(files: File[]) {
    setResult(null);
    setError("");
    const Ctor = (globalThis as unknown as { BarcodeDetector?: BDCtor }).BarcodeDetector;
    if (!Ctor) {
      setError("This browser has no built-in QR reader. Try Chrome, Edge, or Android.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(files[0]);
      const codes = await new Ctor({ formats: ["qr_code"] }).detect(bitmap);
      setResult(codes[0]?.rawValue ?? "");
      if (!codes.length) setError("No QR code found in that image.");
    } catch {
      setError("Could not read that image.");
    }
  }

  const isUrl = result && /^https?:\/\//i.test(result);

  return (
    <ToolShell title="QR Reader" desc="Decode a QR code from an image. Runs locally.">
      <Dropzone accept="image/*" onFiles={run} label="Drop a QR image or click to browse" />
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {result && (
        <div className="mt-6">
          <p className="mb-1 text-xs text-muted">Decoded</p>
          <code className="card block break-all p-3 text-sm">{result}</code>
          <div className="mt-3 flex gap-3">
            <button onClick={() => navigator.clipboard.writeText(result)} className="btn btn-ghost">Copy</button>
            {isUrl && <a href={result} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open link ↗</a>}
          </div>
        </div>
      )}
    </ToolShell>
  );
}
