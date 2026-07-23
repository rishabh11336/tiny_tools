"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { tools } from "@/lib/tools";
import { getFavorites, getRecents } from "@/lib/prefs";
import Icon from "@/components/Icon";

const bySlug = new Map(tools.map((t) => [t.slug, t]));

function Row({ label, slugs }: { label: string; slugs: string[] }) {
  const items = slugs.map((s) => bySlug.get(s)).filter((t): t is NonNullable<typeof t> => !!t?.ready);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      {items.map((t) => (
        <Link
          key={t.slug}
          href={`/${t.slug}`}
          className="card flex items-center gap-2 bg-surface/60 px-3 py-1.5 text-sm transition-colors hover:border-accent"
        >
          <Icon name={t.group} className="h-3.5 w-3.5 text-accent" />
          {t.name}
        </Link>
      ))}
    </div>
  );
}

// Favorites + Recents rails, hydrated from localStorage. Renders nothing until
// mounted (avoids SSR/client mismatch) and nothing when both are empty.
export default function QuickAccess() {
  const [favs, setFavs] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavs(getFavorites());
    setRecents(getRecents());
    setReady(true);
  }, []);

  if (!ready || (favs.length === 0 && recents.length === 0)) return null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Row label="Favorites" slugs={favs} />
      <Row label="Recent" slugs={recents} />
    </div>
  );
}
