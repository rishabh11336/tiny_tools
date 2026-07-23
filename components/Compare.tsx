"use client";
import { useState } from "react";

// Before/after split slider. The overlaid <input type=range> gives keyboard
// + drag for free; the visible clip + handle follow its value.
export default function Compare({
  before,
  after,
  alt = "",
}: {
  before: string;
  after: string;
  alt?: string;
}) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative select-none overflow-hidden rounded-lg border border-border">
      {/* after = base layer */}
      <img src={after} alt={alt ? `${alt} (after)` : "after"} className="block w-full" />
      {/* before = clipped overlay */}
      <img
        src={before}
        alt={alt ? `${alt} (before)` : "before"}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
        Before
      </span>
      <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
        After
      </span>

      {/* divider line + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] text-black shadow">
          ⇔
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Reveal before or after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
