"use client";
import { useEffect } from "react";

// Registers the offline service worker in production only (a SW in dev fights
// hot-reload and caches stale bundles).
export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
