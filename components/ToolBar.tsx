"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isFavorite, pushRecent, toggleFavorite } from "@/lib/prefs";

// Top row of every tool page: back link + favorite star. Also records the
// visit into "recents" on mount. Slug comes from the pathname, so no tool
// page needs to pass anything.
export default function ToolBar() {
  const slug = usePathname().replace(/^\//, "");
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (slug) pushRecent(slug);
    setFav(isFavorite(slug));
  }, [slug]);

  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="text-xs text-muted transition-colors hover:text-fg">
        ← all tools
      </Link>
      <button
        onClick={() => setFav(toggleFavorite(slug))}
        aria-pressed={fav}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-fg"
      >
        <svg
          viewBox="0 0 24 24"
          fill={fav ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 ${fav ? "text-accent" : ""}`}
          aria-hidden
        >
          <path d="m12 17.3-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" />
        </svg>
        {fav ? "Favorited" : "Favorite"}
      </button>
    </div>
  );
}
