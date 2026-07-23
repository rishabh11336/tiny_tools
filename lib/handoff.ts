"use client";
import { useEffect } from "react";

// In-memory hand-off so a tool's result can be piped into another tool
// without re-uploading. Lives in the module (survives client-side nav within
// the SPA); intentionally NOT persisted — a hard reload clears it.
// ponytail: single slot, last-writer-wins; enough for one "Send to" at a time.
let pending: File[] | null = null;

export function setHandoff(files: File[]) {
  pending = files;
}

// Consume the pending files once, on mount. Target tools call useHandoff(run).
export function useHandoff(onFiles: (files: File[]) => void) {
  useEffect(() => {
    if (pending && pending.length) {
      const files = pending;
      pending = null;
      onFiles(files);
    }
    // mount-only: the slot is drained on first read
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
