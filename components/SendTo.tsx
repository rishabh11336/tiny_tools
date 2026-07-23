"use client";
import { useRouter } from "next/navigation";
import { setHandoff } from "@/lib/handoff";

type Target = { slug: string; label: string };

// Pipes a result (by object-URL) into another tool: fetch the blob back into a
// File, stash it, navigate. No upload — the blob never leaves the browser.
export default function SendTo({
  url,
  name,
  targets,
}: {
  url: string;
  name: string;
  targets: Target[];
}) {
  const router = useRouter();

  async function send(slug: string) {
    const blob = await (await fetch(url)).blob();
    setHandoff([new File([blob], name, { type: blob.type })]);
    router.push(`/${slug}`);
  }

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <span>Send to</span>
      {targets.map((t) => (
        <button
          key={t.slug}
          onClick={() => send(t.slug)}
          className="rounded-full border border-border-strong px-2 py-0.5 transition-colors hover:border-accent hover:text-fg"
        >
          {t.label} →
        </button>
      ))}
    </span>
  );
}
