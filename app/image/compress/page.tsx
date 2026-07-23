"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";
import Compare from "@/components/Compare";
import SendTo from "@/components/SendTo";
import { downloadZip } from "@/lib/zip";
import { useHandoff } from "@/lib/handoff";

type Row = { name: string; before: number; after: number; url: string; origUrl: string };

const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;

export default function CompressImage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [quality, setQuality] = useState(0.7);

  async function run(files: File[]) {
    setBusy(true);
    const out: Row[] = [];
    for (const f of files) {
      try {
        const c = await imageCompression(f, {
          maxSizeMB: 10,
          maxWidthOrHeight: 4096,
          initialQuality: quality,
          useWebWorker: true,
        });
        out.push({
          name: f.name,
          before: f.size,
          after: c.size,
          url: URL.createObjectURL(c),
          origUrl: URL.createObjectURL(f),
        });
      } catch {
        // skip unreadable file
      }
    }
    setRows((r) => [...out, ...r]);
    setBusy(false);
  }

  useHandoff(run);

  return (
    <ToolShell title="Compress Image" desc="Reduce JPG / PNG / WebP file size. Runs locally.">
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { l: "Web", q: 0.8 },
          { l: "Balanced", q: 0.6 },
          { l: "Small", q: 0.4 },
        ].map((p) => (
          <button
            key={p.l}
            onClick={() => setQuality(p.q)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              quality === p.q
                ? "border-accent text-accent"
                : "border-border-strong text-muted hover:text-fg"
            }`}
          >
            {p.l} · {Math.round(p.q * 100)}%
          </button>
        ))}
      </div>

      <label className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-muted">Quality</span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="accent-accent"
        />
        <span className="w-10 tabular-nums text-muted">{Math.round(quality * 100)}%</span>
      </label>

      <Dropzone accept="image/*" multiple onFiles={run} label="Drop images or click to browse" />
      {busy && <p className="mt-4 text-sm text-muted">Compressing…</p>}

      {rows[0] && (
        <div className="mt-6">
          <p className="mb-2 text-xs text-muted">Drag to compare — {rows[0].name}</p>
          <Compare before={rows[0].origUrl} after={rows[0].url} alt={rows[0].name} />
        </div>
      )}

      {rows.length > 1 && (
        <button
          onClick={() =>
            downloadZip(
              "compressed-images.zip",
              rows.map((r) => ({ name: `compressed-${r.name}`, url: r.url })),
            )
          }
          className="btn btn-ghost mt-6 w-full"
        >
          Download all ({rows.length}) as .zip
        </button>
      )}

      {rows.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rows.map((r, i) => {
            const pct = r.before ? Math.round((1 - r.after / r.before) * 100) : 0;
            return (
              <li
                key={i}
                className="card flex flex-wrap items-center justify-between gap-3 p-3 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{r.name}</span>
                <span className="shrink-0 text-muted">
                  {kb(r.before)} → {kb(r.after)}{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">−{pct}%</span>
                </span>
                <SendTo
                  url={r.url}
                  name={r.name}
                  targets={[
                    { slug: "image/convert", label: "Convert" },
                    { slug: "image/resize", label: "Resize" },
                  ]}
                />
                <a
                  href={r.url}
                  download={`compressed-${r.name}`}
                  className="btn btn-primary shrink-0 px-3 py-1.5"
                >
                  Save
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </ToolShell>
  );
}
