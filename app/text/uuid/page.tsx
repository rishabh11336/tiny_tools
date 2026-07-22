"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function UuidTool() {
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  const gen = () => setIds(Array.from({ length: Math.min(Math.max(count, 1), 1000) }, () => crypto.randomUUID()));

  return (
    <ToolShell title="UUID Generator" desc="Random v4 UUIDs from the browser crypto API.">
      <div className="flex items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-muted">How many</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="field w-28"
          />
        </label>
        <button onClick={gen} className="btn btn-primary">Generate</button>
      </div>

      {ids.length > 0 && (
        <div className="mt-5">
          <pre className="card max-h-80 overflow-auto p-3 text-xs">{ids.join("\n")}</pre>
          <button onClick={() => navigator.clipboard.writeText(ids.join("\n"))} className="btn btn-ghost mt-3">
            Copy all
          </button>
        </div>
      )}
    </ToolShell>
  );
}
