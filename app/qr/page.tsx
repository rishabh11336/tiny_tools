"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import ToolShell from "@/components/ToolShell";

export default function QrGen() {
  const [text, setText] = useState("https://rishabhsingh.me");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!text) {
      setUrl("");
      return;
    }
    QRCode.toDataURL(text, { width: 512, margin: 2, errorCorrectionLevel: "M" })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [text]);

  return (
    <ToolShell title="QR Code Generator" desc="Type text or a URL, get a QR code. Nothing leaves your browser.">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Enter text or URL…"
        className="field resize-none"
      />

      {url && (
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="QR code"
            width={256}
            height={256}
            className="rounded-xl border border-border bg-white p-3 shadow-sm"
          />
          <a href={url} download="qr.png" className="btn btn-primary">
            Download PNG
          </a>
        </div>
      )}
    </ToolShell>
  );
}
