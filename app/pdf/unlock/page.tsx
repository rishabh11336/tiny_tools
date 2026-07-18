"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState<string | null>(null);

  async function unlock() {
    if (!file) return;
    setBusy(true);
    setError("");
    setUrl(null);
    try {
      const mupdf = await import("mupdf");
      const doc = mupdf.Document.openDocument(await file.arrayBuffer(), "application/pdf");
      if (doc.needsPassword() && doc.authenticatePassword(password) === 0) {
        setError("Wrong password. Try again.");
        return;
      }
      const pdf = doc.asPDF();
      if (!pdf) {
        setError("Not a valid PDF.");
        return;
      }
      const bytes = pdf.saveToBuffer({ encrypt: "none" }).asUint8Array();
      setUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" })));
    } catch {
      setError("Could not read this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell
      title="Remove PDF Password"
      desc="Unlock a password-protected PDF you own. Password and file stay in your browser — nothing is uploaded."
    >
      <Dropzone
        accept="application/pdf"
        onFiles={(f) => {
          setFile(f[0]);
          setUrl(null);
          setError("");
        }}
        label={file ? file.name : "Drop the locked PDF or click to browse"}
      />

      {file && (
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="PDF password"
            className="field"
          />
          <button onClick={unlock} disabled={busy} className="btn btn-primary self-start">
            {busy ? "Unlocking…" : "Unlock PDF"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {url && (
        <a
          href={url}
          download={file ? `unlocked-${file.name}` : "unlocked.pdf"}
          className="btn btn-ghost mt-5"
        >
          ↓ Download unlocked PDF
        </a>
      )}
    </ToolShell>
  );
}
