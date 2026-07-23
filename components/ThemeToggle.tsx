"use client";
import { useEffect, useState } from "react";

type Mode = "light" | "dark";

// Toggles a forced [data-theme] on <html>, persisted. No-flash init lives in
// the beforeInteractive script in layout; this only reflects + flips state.
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const set = () => {
      const forced = document.documentElement.getAttribute("data-theme") as Mode | null;
      setMode(
        forced ??
          (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
      );
    };
    set();
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("tt-theme", next);
    } catch {}
    setMode(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted transition-colors hover:border-accent hover:text-fg"
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}
    >
      {/* sun in dark mode (click → light), moon in light mode */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        {mode === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        )}
      </svg>
    </button>
  );
}
