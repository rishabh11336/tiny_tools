"use client";
import { useState } from "react";
import ToolShell from "@/components/ToolShell";

const words = (s: string) => s.match(/[A-Za-z0-9]+/g) ?? [];
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const transforms: Record<string, (s: string) => string> = {
  UPPERCASE: (s) => s.toUpperCase(),
  lowercase: (s) => s.toLowerCase(),
  "Title Case": (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
  Sentence: (s) => s.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
  camelCase: (s) => words(s).map((w, i) => (i ? cap(w) : w.toLowerCase())).join(""),
  snake_case: (s) => words(s).map((w) => w.toLowerCase()).join("_"),
  "kebab-case": (s) => words(s).map((w) => w.toLowerCase()).join("-"),
};

export default function CaseTool() {
  const [text, setText] = useState("");

  return (
    <ToolShell title="Case Converter" desc="Convert text between common cases. Runs locally.">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type or paste text…"
        className="field resize-none"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.keys(transforms).map((name) => (
          <button key={name} onClick={() => setText(transforms[name](text))} className="btn btn-ghost px-3 py-1.5 text-sm">
            {name}
          </button>
        ))}
      </div>
    </ToolShell>
  );
}
