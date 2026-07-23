import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/tools";
import CommandPalette from "@/components/CommandPalette";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "tiny tools — free client-side file tools",
  description:
    "Free browser-based tools for PDF, images, SVG, audio and video. Files never leave your device — everything runs locally in your browser.",
};

const GA_ID = "G-3REDBP6J91";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('tt-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
          <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
            <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
              tiny<span className="text-accent">/</span>tools
            </Link>
            <div className="flex items-center gap-3">
              <CommandPalette />
              <ThemeToggle />
              <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                runs in your browser
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-10">{children}</main>
        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          Files stay on your device. No uploads, no servers.
        </footer>

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
