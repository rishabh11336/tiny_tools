"use client";
import { useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

// ponytail: regex minify, not full SVGO. Handles the common bloat from
// Illustrator/Figma/Inkscape exports (comments, editor metadata, whitespace).
// Swap in the `svgo` browser build if path/number optimization is ever needed.
function minify(svg: string): string {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/g, "") // XML prolog
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "") // doctype
    .replace(/<!--[\s\S]*?-->/g, "") // comments
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, "") // editor metadata
    .replace(/\s(sodipodi|inkscape):[a-z-]+="[^"]*"/gi, "") // editor attrs
    .replace(/\sxmlns:(sodipodi|inkscape|dc|cc|rdf)="[^"]*"/gi, "") // editor namespaces
    .replace(/>\s+</g, "><") // whitespace between tags
    .replace(/\s{2,}/g, " ") // collapse runs of whitespace
    .trim();
}

const kb = (b: number) => `${(b / 1024).toFixed(1)} KB`;

export default function OptimizeSvg() {
  const [name, setName] = useState("");
  const [before, setBefore] = useState(0);
  const [after, setAfter] = useState(0);
  const [url, setUrl] = useState<string | null>(null);

  async function run(files: File[]) {
    const f = files.find((x) => x.name.endsWith(".svg") || x.type === "image/svg+xml");
    if (!f) return;
    const text = await f.text();
    const out = minify(text);
    setName(f.name);
    setBefore(new Blob([text]).size);
    setAfter(new Blob([out]).size);
    setUrl(URL.createObjectURL(new Blob([out], { type: "image/svg+xml" })));
  }

  const pct = before ? Math.round((1 - after / before) * 100) : 0;

  return (
    <ToolShell title="Optimize SVG" desc="Strip comments, editor metadata and whitespace from SVG files. Runs locally.">
      <Dropzone accept="image/svg+xml,.svg" onFiles={run} label="Drop an SVG or click to browse" />

      {url && (
        <div className="mt-6">
          <div className="card flex items-center justify-between gap-3 p-3 text-sm">
            <span className="truncate">{name}</span>
            <span className="shrink-0 text-muted">
              {kb(before)} → {kb(after)}{" "}
              <span className="text-emerald-600 dark:text-emerald-400">−{pct}%</span>
            </span>
          </div>
          <a href={url} download={name.replace(/\.svg$/i, "") + ".min.svg"} className="btn btn-primary mt-4">
            ↓ Download optimized SVG
          </a>
        </div>
      )}
    </ToolShell>
  );
}
