"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function UrlTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  let out = "";
  let err = "";
  try {
    out = text ? (mode === "encode" ? encodeURIComponent(text) : decodeURIComponent(text)) : "";
  } catch {
    err = "Invalid percent-encoding.";
  }

  return (
    <ToolShell title="URL Encode / Decode" desc="Escape or unescape text for URLs. Runs locally.">
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
        placeholder={mode === "encode" ? "Text to encode…" : "Encoded text to decode…"}
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
