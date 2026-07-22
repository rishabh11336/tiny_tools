"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

// Unicode-safe Base64 via UTF-8 bytes.
const enc = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const dec = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));

export default function Base64Tool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  let out = "";
  let err = "";
  try {
    out = text ? (mode === "encode" ? enc(text) : dec(text)) : "";
  } catch {
    err = "Invalid Base64 input.";
  }

  return (
    <ToolShell title="Base64 Encode / Decode" desc="Text ↔ Base64, Unicode-safe. Runs locally.">
      <div className="mb-4 flex gap-2 text-sm">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={mode === m ? "btn btn-primary px-3 py-1.5" : "btn btn-ghost px-3 py-1.5"}
          >
            {m === "encode" ? "Encode" : "Decode"}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={mode === "encode" ? "Text to encode…" : "Base64 to decode…"}
        className="field resize-none"
      />
      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      {out && (
        <div className="mt-4">
          <code className="card block break-all p-3 text-xs whitespace-pre-wrap">{out}</code>
          <button onClick={() => navigator.clipboard.writeText(out)} className="btn btn-ghost mt-3">
            Copy
          </button>
        </div>
      )}
    </ToolShell>
  );
}
