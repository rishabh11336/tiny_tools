"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const base = (n: string) => n.replace(/\.[^.]+$/, "");

export default function ExtractPdfText() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(files: File[]) {
    const f = files.find((x) => x.type === "application/pdf");
    if (!f) return;
    setBusy(true);
    setText("");
    setName(f.name);
    try {
      const mupdf = await import("mupdf");
      const doc = mupdf.Document.openDocument(await f.arrayBuffer(), "application/pdf");
      const parts: string[] = [];
      for (let i = 0; i < doc.countPages(); i++) {
        parts.push(doc.loadPage(i).toStructuredText("preserve-whitespace").asText());
      }
      setText(parts.join("\n\n").trim() || "(No selectable text — this PDF may be scanned images.)");
    } finally {
      setBusy(false);
    }
  }

  const dl = () => URL.createObjectURL(new Blob([text], { type: "text/plain" }));

  return (
    <ToolShell title="Extract PDF Text" desc="Pull selectable text out of a PDF. Runs locally.">
      <Dropzone accept="application/pdf" onFiles={run} label="Drop a PDF or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Extracting…</p>}

      {text && (
        <div className="mt-6">
          <textarea readOnly value={text} rows={12} className="field resize-none font-mono text-xs" />
          <div className="mt-3 flex gap-3">
            <button onClick={() => navigator.clipboard.writeText(text)} className="btn btn-ghost">Copy</button>
            <a href={dl()} download={`${base(name)}.txt`} className="btn btn-primary">↓ Download .txt</a>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
