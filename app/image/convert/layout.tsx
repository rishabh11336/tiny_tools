import type { Metadata } from "next";
import { toolMeta } from "@/lib/tools";

export const metadata: Metadata = toolMeta("image/convert");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
