"use client";
import { useEffect, useState } from "react";
import ToolShell from "@/components/ToolShell";

type Algo = "SHA-1" | "SHA-256" | "SHA-512";

async function hash(text: string, algo: Algo): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashTool() {
  const [text, setText] = useState("");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!text) return setOut("");
    hash(text, algo).then(setOut);
  }, [text, algo]);

  return (
    <ToolShell title="Hash Generator" desc="SHA-1 / 256 / 512 of any text, computed in your browser.">
      <div className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Algorithm</span>
        <select value={algo} onChange={(e) => setAlgo(e.target.value as Algo)} className="field w-auto">
          <option>SHA-256</option>
          <option>SHA-1</option>
          <option>SHA-512</option>
        </select>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type or paste text…"
        className="field resize-none"
      />
      {out && (
        <div className="mt-4">
          <p className="mb-1 text-xs text-muted">{algo} · {out.length * 4} bits</p>
          <code className="card block break-all p-3 text-xs">{out}</code>
          <button onClick={() => navigator.clipboard.writeText(out)} className="btn btn-ghost mt-3">
            Copy
          </button>
        </div>
      )}
    </ToolShell>
  );
}
