import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tiny tools — private file tools",
    short_name: "tiny/tools",
    description:
      "Free browser-based tools for PDF, images, SVG, audio and video. Nothing uploads — works offline.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfa",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
