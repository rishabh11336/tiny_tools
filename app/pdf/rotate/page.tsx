"use client";
import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(files: File[]) {
    const f = files.find((x) => x.type === "application/pdf");
    if (f) {
      setFile(f);
      setUrl(null);
    }
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    const doc = await PDFDocument.load(await file.arrayBuffer());
    for (const page of doc.getPages()) {
      // Add to any existing rotation so it composes predictably.
      page.setRotation(degrees((page.getRotation().angle + angle) % 360));
    }
    const bytes = await doc.save();
    setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    setBusy(false);
  }

  return (
    <ToolShell title="Rotate PDF" desc="Rotate every page by 90, 180 or 270°. Runs locally.">
      <Dropzone accept="application/pdf" onFiles={pick} label={file ? file.name : "Drop a PDF or click to browse"} />

      {file && (
        <>
          <div className="mt-5 flex gap-2">
            {[90, 180, 270].map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAngle(a);
                  setUrl(null);
                }}
                className={angle === a ? "btn btn-primary px-4 py-1.5" : "btn btn-ghost px-4 py-1.5"}
              >
                {a}°
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={run} disabled={busy} className="btn btn-primary">
              {busy ? "Rotating…" : "Rotate"}
            </button>
            {url && (
              <a href={url} download={`rotated-${file.name}`} className="btn btn-ghost">↓ Download</a>
            )}
          </div>
        </>
      )}
    </ToolShell>
  );
}
