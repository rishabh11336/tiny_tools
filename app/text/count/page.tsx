"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function CountTool() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const stats = [
    { label: "Words", value: words },
    { label: "Characters", value: text.length },
    { label: "No spaces", value: text.replace(/\s/g, "").length },
    { label: "Lines", value: text ? text.split(/\r\n|\r|\n/).length : 0 },
  ];

  return (
    <ToolShell title="Word & Character Counter" desc="Live counts as you type. Runs locally.">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Type or paste text…"
        className="field resize-none"
      />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
            <div className="mt-0.5 text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </ToolShell>
  );
}
