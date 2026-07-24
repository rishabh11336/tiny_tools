"use client";
import { useEffect, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import ToolShell from "@/components/ToolShell";

const base = (n: string) => n.replace(/\.[^.]+$/, "");
const checker = {
  backgroundImage: "repeating-conic-gradient(#ccc 0 25%, transparent 0 50%)",
  backgroundSize: "20px 20px",
} as const;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

type Mode = "erase" | "restore";

export default function RemoveBg() {
  const editRef = useRef<HTMLCanvasElement>(null);
  const origRef = useRef<HTMLCanvasElement | null>(null); // full-res original, for Restore
  const resultRef = useRef<HTMLImageElement | null>(null); // auto result, for Reset
  const last = useRef<{ x: number; y: number } | null>(null);
  const undoStack = useRef<string[]>([]); // ponytail: dataURL snapshots, cap 20; region diffs if memory bites

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [mode, setMode] = useState<Mode>("erase");
  const [brush, setBrush] = useState(24); // radius in displayed px
  const [canUndo, setCanUndo] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null); // brush outline, display coords

  // Paint the auto result once the sized <canvas> has mounted.
  useEffect(() => {
    if (size) paintResult();
  }, [size]);

  // Ctrl/Cmd+Z to undo the last stroke.
  useEffect(() => {
    if (!size) return;
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [size]);

  function paintResult() {
    const cv = editRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(resultRef.current!, 0, 0, cv.width, cv.height);
    undoStack.current = [];
    setCanUndo(false);
  }

  function snapshot() {
    const s = undoStack.current;
    s.push(editRef.current!.toDataURL());
    if (s.length > 20) s.shift();
    setCanUndo(true);
  }

  async function undo() {
    const url = undoStack.current.pop();
    if (!url) return;
    const img = await loadImg(url);
    const cv = editRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0);
    setCanUndo(undoStack.current.length > 0);
  }

  async function run(files: File[]) {
    setBusy(true);
    setSize(null);
    setErr("");
    setPct(0);
    setName(files[0].name);
    try {
      const orig = await loadImg(URL.createObjectURL(files[0]));
      const oc = document.createElement("canvas");
      oc.width = orig.naturalWidth;
      oc.height = orig.naturalHeight;
      oc.getContext("2d")!.drawImage(orig, 0, 0);
      origRef.current = oc;

      // Model (~tens of MB) downloads on first use, then caches. Inference is local.
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(files[0], {
        progress: (_key, current, total) => setPct(total ? Math.round((current / total) * 100) : 0),
      });
      resultRef.current = await loadImg(URL.createObjectURL(blob));
      setSize({ w: oc.width, h: oc.height });
    } catch {
      setErr("Could not process this image.");
    } finally {
      setBusy(false);
    }
  }

  // Pointer → canvas pixel coords.
  function toCanvas(e: React.PointerEvent) {
    const cv = editRef.current!;
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
  }

  // One brush dab at a canvas-space point.
  function dab(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
    } else {
      ctx.clip();
      ctx.drawImage(origRef.current!, 0, 0); // restore original pixels inside the circle
    }
    ctx.restore();
  }

  // Interpolate dabs between two points so fast drags leave no gaps.
  function stroke(a: { x: number; y: number }, b: { x: number; y: number }) {
    const cv = editRef.current!;
    const ctx = cv.getContext("2d")!;
    const r = brush * (cv.width / cv.getBoundingClientRect().width);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.floor(dist / (r / 2)));
    for (let i = 0; i <= steps; i++) dab(ctx, a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps, r);
  }

  function down(e: React.PointerEvent) {
    e.preventDefault();
    editRef.current!.setPointerCapture(e.pointerId);
    snapshot();
    const p = toCanvas(e);
    last.current = p;
    stroke(p, p);
  }
  function move(e: React.PointerEvent) {
    const cv = editRef.current!;
    const r = cv.getBoundingClientRect();
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
    if (!last.current) return;
    const p = toCanvas(e);
    stroke(last.current, p);
    last.current = p;
  }
  function up() {
    last.current = null;
  }
  function leave() {
    last.current = null;
    setCursor(null);
  }

  async function download() {
    const cv = editRef.current!;
    const blob: Blob = await new Promise((r) => cv.toBlob((b) => r(b!), "image/png"));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${base(name)}-no-bg.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <ToolShell title="Remove Background" desc="Erase an image background in your browser, then brush to fix edges. First use downloads a model; nothing is uploaded.">
      {!size && <Dropzone accept="image/*" onFiles={run} label="Drop an image or click to browse" />}
      {busy && <p className="mt-4 text-sm text-muted">Working… {pct}%</p>}
      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}

      {size && (
        <div className="flex flex-col items-start gap-4">
          <div className="relative inline-block leading-none">
            <canvas
              ref={editRef}
              width={size.w}
              height={size.h}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerLeave={leave}
              className="block max-h-[70vh] max-w-full touch-none cursor-crosshair rounded-lg border border-border"
              style={checker}
            />
            {cursor && (
              <div
                className="pointer-events-none absolute rounded-full border border-white mix-blend-difference"
                style={{ left: cursor.x - brush, top: cursor.y - brush, width: brush * 2, height: brush * 2 }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-lg border border-border">
              {(["erase", "restore"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                    mode === m ? "bg-accent text-white" : "text-muted hover:text-fg"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              Brush
              <input type="range" min={5} max={80} value={brush} onChange={(e) => setBrush(+e.target.value)} className="accent-accent" />
              <span className="w-8 tabular-nums">{brush}</span>
            </label>

            <button
              onClick={undo}
              disabled={!canUndo}
              className="text-sm text-muted transition-colors hover:text-fg disabled:opacity-40 disabled:hover:text-muted"
            >
              undo
            </button>
            <button onClick={paintResult} className="text-sm text-muted transition-colors hover:text-fg">
              reset edits
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={download} className="btn btn-primary">↓ Download PNG</button>
            <button
              onClick={() => { setSize(null); setErr(""); }}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              start over
            </button>
          </div>
          <p className="text-xs text-muted"><b>Erase</b> removes more · <b>Restore</b> brings the original back.</p>
        </div>
      )}
    </ToolShell>
  );
}
