"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function JsonTool() {
  const [text, setText] = useState("");
  const [indent, setIndent] = useState(2);
  let out = "";
  let err = "";
  if (text.trim()) {
    try {
      out = JSON.stringify(JSON.parse(text), null, indent);
    } catch (e) {
      err = e instanceof Error ? e.message : "Invalid JSON.";
    }
  }

  return (
    <ToolShell title="JSON Formatter" desc="Pretty-print and validate JSON. Runs locally.">
      <div className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Indent</span>
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="field w-auto">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={0}>minify</option>
        </select>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder='{"paste":"JSON here"}'
        className="field resize-none font-mono text-xs"
      />
      {err && <p className="mt-3 text-sm text-red-500">⚠ {err}</p>}
      {out && (
        <div className="mt-4">
          <pre className="card overflow-x-auto p-3 text-xs">{out}</pre>
          <button onClick={() => navigator.clipboard.writeText(out)} className="btn btn-ghost mt-3">
            Copy
          </button>
        </div>
      )}
    </ToolShell>
  );
}
