"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
type Key = keyof typeof SETS;

// Unbiased pick via rejection sampling on crypto random bytes.
function pick(pool: string): string {
  const max = 256 - (256 % pool.length);
  const buf = new Uint8Array(1);
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= max);
  return pool[v % pool.length];
}

export default function PasswordTool() {
  const [len, setLen] = useState(16);
  const [on, setOn] = useState<Record<Key, boolean>>({ lower: true, upper: true, digits: true, symbols: true });
  const [pw, setPw] = useState("");

  function gen() {
    const pool = (Object.keys(SETS) as Key[]).filter((k) => on[k]).map((k) => SETS[k]).join("");
    if (!pool) return setPw("");
    setPw(Array.from({ length: len }, () => pick(pool)).join(""));
  }

  return (
    <ToolShell title="Password Generator" desc="Strong random passwords from crypto.getRandomValues.">
      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted">Length</span>
        <input type="range" min={6} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} className="accent-accent" />
        <span className="w-8 tabular-nums text-muted">{len}</span>
      </label>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {(Object.keys(SETS) as Key[]).map((k) => (
          <label key={k} className="flex items-center gap-2 text-muted">
            <input type="checkbox" checked={on[k]} onChange={(e) => setOn((s) => ({ ...s, [k]: e.target.checked }))} className="accent-accent" />
            {k}
          </label>
        ))}
      </div>

      <button onClick={gen} className="btn btn-primary mt-5">Generate</button>

      {pw && (
        <div className="mt-5">
          <code className="card block break-all p-3 text-sm">{pw}</code>
          <button onClick={() => navigator.clipboard.writeText(pw)} className="btn btn-ghost mt-3">Copy</button>
        </div>
      )}
    </ToolShell>
  );
}
