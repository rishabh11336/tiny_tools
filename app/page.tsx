import Link from "next/link";
import { tools, groups } from "@/lib/tools";
import Icon from "@/components/Icon";
import QuickAccess from "@/components/QuickAccess";

const trust = [
  { t: "100% private", d: "Files never leave your device" },
  { t: "No sign-up", d: "Open a tool and go" },
  { t: "Instant", d: "Runs on your own hardware" },
];

// Per-group accent along one indigo→violet→teal arc — cards + icons inherit
// it via the --accent var, making groups scannable without new brand colors.
const groupAccent: Record<string, string> = {
  Image: "#8b5cf6",
  PDF: "#4f46e5",
  SVG: "#0891b2",
  Audio: "#0d9488",
  Video: "#c026d3",
  Utility: "#6366f1",
};

export default function Home() {
  const ready = tools.filter((t) => t.ready).length;

  return (
    <div>
      {/* Hero */}
      <section className="py-12 sm:py-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {ready} free tools · nothing uploaded
        </span>
        <h1 className="text-gradient mx-auto mt-6 max-w-2xl text-5xl sm:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
          Tiny tools for your files
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted text-balance">
          Compress, convert and edit PDFs, images and more — right in your
          browser. Nothing is uploaded. Nothing leaves your device.
        </p>

        {/* Trust strip */}
        <div className="mx-auto mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
          {trust.map((x) => (
            <div key={x.t} className="card bg-surface/60 px-4 py-3 text-left backdrop-blur">
              <div className="text-sm font-medium">{x.t}</div>
              <div className="mt-0.5 text-xs text-muted">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      <QuickAccess />

      {/* Tool groups */}
      {groups.map((g) => {
        const items = tools.filter((t) => t.group === g);
        if (items.length === 0) return null;
        return (
          <section
            key={g}
            className="mt-12"
            style={{ "--accent": groupAccent[g] } as React.CSSProperties}
          >
            <div className="mb-4 flex items-center gap-2.5 text-muted">
              <span className="icon-tile h-6 w-6">
                <Icon name={g} className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-xs font-medium uppercase tracking-widest">{g}</h2>
              <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) =>
                t.ready ? (
                  <Link key={t.slug} href={`/${t.slug}`} className="tool-card group p-5">
                    <div className="flex items-start justify-between">
                      <span className="icon-tile h-10 w-10">
                        <Icon name={t.group} className="h-5 w-5" />
                      </span>
                      <span className="text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
                        →
                      </span>
                    </div>
                    <div className="mt-4 font-medium">{t.name}</div>
                    <div className="mt-1 text-[13px] leading-relaxed text-muted">{t.desc}</div>
                  </Link>
                ) : (
                  <div key={t.slug} className="card p-5 opacity-50">
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-muted">
                        <Icon name={t.group} className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                        soon
                      </span>
                    </div>
                    <div className="mt-4 font-medium">{t.name}</div>
                    <div className="mt-1 text-[13px] leading-relaxed text-muted">{t.desc}</div>
                  </div>
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
