import type { Metadata } from "next";
import { toolMeta } from "@/lib/tools";

export const metadata: Metadata = toolMeta("text/base64");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
