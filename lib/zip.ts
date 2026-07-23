import { zipSync } from "fflate";

// Bundle already-produced object-URL results into one .zip and download it.
// level 0 — inputs (images/pdfs) are already compressed, deflate wastes CPU.
export async function downloadZip(
  zipName: string,
  files: { name: string; url: string }[],
) {
  const entries: Record<string, Uint8Array> = {};
  const seen = new Map<string, number>();
  for (const f of files) {
    // de-dupe collisions: foo.png, foo (2).png …
    let name = f.name;
    const n = seen.get(f.name) ?? 0;
    if (n) name = f.name.replace(/(\.[^.]+)?$/, ` (${n + 1})$1`);
    seen.set(f.name, n + 1);
    entries[name] = new Uint8Array(await (await fetch(f.url)).arrayBuffer());
  }
  const blob = new Blob([zipSync(entries, { level: 0 })], { type: "application/zip" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(href);
}
