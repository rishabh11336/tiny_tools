// Lazy single-threaded ffmpeg.wasm loader. Single-thread core needs no
// SharedArrayBuffer, so no COOP/COEP headers and GA4 stays untouched.
// Core (~25MB) is fetched from CDN on first use only; all processing is local.
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export function getFFmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance);
  if (!loading) {
    loading = (async () => {
      const ff = new FFmpeg();
      if (onProgress) ff.on("progress", ({ progress }) => onProgress(progress));
      await ff.load({
        coreURL: await toBlobURL(`${CORE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE}/ffmpeg-core.wasm`, "application/wasm"),
      });
      instance = ff;
      return ff;
    })();
  }
  return loading;
}

const ext = (name: string) => name.match(/\.[^.]+$/)?.[0] ?? "";

// Run one ffmpeg command: write input → exec → read output → object URL.
export async function transcode(
  file: File,
  buildArgs: (input: string, output: string) => string[],
  outName: string,
  mime: string,
  onProgress?: (ratio: number) => void,
): Promise<string> {
  const ff = await getFFmpeg(onProgress);
  const input = "input" + ext(file.name);
  ff.on("progress", ({ progress }) => onProgress?.(progress));
  await ff.writeFile(input, await fetchFile(file));
  await ff.exec(buildArgs(input, outName));
  const data = await ff.readFile(outName);
  return URL.createObjectURL(new Blob([data as BlobPart], { type: mime }));
}
