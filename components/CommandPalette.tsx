"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tools } from "@/lib/tools";
import Icon from "@/components/Icon";

// ⌘K / Ctrl+K command palette over the tool registry. Renders its own
// header trigger + the overlay. Client-only; routes with next/navigation.
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const ready = useMemo(() => tools.filter((t) => t.ready), []);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ready;
    return ready.filter((t) =>
      `${t.name} ${t.desc} ${t.group} ${t.slug}`.toLowerCase().includes(s),
    );
  }, [q, ready]);

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/${slug}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border-strong px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-fg"
        aria-label="Search tools"
      >
        <Icon name="Search" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden font-mono text-[10px] text-muted sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[14vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
            className="card w-full max-w-lg overflow-hidden bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Icon name="Search" className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const t = results[active];
                    if (t) go(t.slug);
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
                placeholder="Search tools…"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted"
              />
            </div>
            <ul ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  No tools match “{q}”.
                </li>
              )}
              {results.map((t, i) => (
                <li key={t.slug}>
                  <button
                    data-active={i === active}
                    onClick={() => go(t.slug)}
                    onMouseMove={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${
                      i === active ? "bg-surface-2" : ""
                    }`}
                  >
                    <span className="icon-tile h-8 w-8 shrink-0">
                      <Icon name={t.group} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{t.name}</span>
                      <span className="block truncate text-xs text-muted">{t.desc}</span>
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted">
                      {t.group}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
