import type { Metadata } from "next";
import { toolMeta } from "@/lib/tools";

export const metadata: Metadata = toolMeta("video/to-gif");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
