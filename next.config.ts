import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // mupdf-wasm.js has a Node-only branch (`await import("module")`) that the
    // browser bundle never runs; stub it so Turbopack stops trying to resolve it.
    resolveAlias: {
      module: { browser: "./lib/empty.js" },
    },
  },
};

export default nextConfig;
