// node remotion/youtube-poles/render.mjs [en] [tr] [shorts-en] [shorts-ar] [--stills] [--frames=a,b]
// Çıktı: out/poles-youtube-{lang}.mp4 + poles-thumb-{lang}.jpg · out/poles-shorts-{lang}.mp4 + poles-shorts-cover-{lang}.jpg
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, ensureBrowser } from "@remotion/renderer";

const DIR = import.meta.dirname;
const OUT = path.join(DIR, "out");
const args = process.argv.slice(2);
const stillsOnly = args.includes("--stills");
const langs = args.filter((a) => !a.startsWith("--"));
const list = langs.length ? langs : ["en", "tr"];
// "en" → poles-youtube-en / poles-thumb-en · "shorts-ar" → poles-shorts-ar / poles-shorts-cover-ar
const ids = (k) => (k.startsWith("shorts-") ? { video: `poles-${k}`, still: `poles-shorts-cover-${k.slice(7)}` } : { video: `poles-youtube-${k}`, still: `poles-thumb-${k}` });

fs.mkdirSync(OUT, { recursive: true });
await ensureBrowser();
const serveUrl = await bundle({ entryPoint: path.join(DIR, "index.tsx"), publicDir: path.join(DIR, "public") });

// --frames=60,200,...  → yalnız kontrol kareleri (out/check/{lang}-{frame}.jpg)
const framesArg = args.find((a) => a.startsWith("--frames="));
if (framesArg) {
  fs.mkdirSync(path.join(OUT, "check"), { recursive: true });
  for (const lang of list) {
    const composition = await selectComposition({ serveUrl, id: ids(lang).video });
    for (const frame of framesArg.slice(9).split(",").map(Number)) {
      const output = path.join(OUT, "check", `${lang}-${frame}.jpg`);
      await renderStill({ composition, serveUrl, output, frame, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
      console.log(output);
    }
  }
  process.exit(0);
}

for (const lang of list) {
  const thumb = await selectComposition({ serveUrl, id: ids(lang).still });
  const tOut = path.join(OUT, `${ids(lang).still}.jpg`);
  await renderStill({ composition: thumb, serveUrl, output: tOut, imageFormat: "jpeg", jpegQuality: 92 });
  console.log("thumb", tOut);
  if (stillsOnly) continue;
  const composition = await selectComposition({ serveUrl, id: ids(lang).video });
  const outputLocation = path.join(OUT, `${ids(lang).video}.mp4`);
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 18,
    pixelFormat: "yuv420p",
    audioCodec: "aac",
    outputLocation,
    concurrency: "75%",
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) { last = p; console.log(`${lang} ${p * 10}%`); }
    },
  });
  console.log(`${outputLocation}  ${(fs.statSync(outputLocation).size / 1048576).toFixed(1)} MB  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
