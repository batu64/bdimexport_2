// Remotion offline render (OPUS_TASARIM D8): node scripts/render-video.mjs [kompozisyon-id ...]
// Çıktı: public/media/video/{id}.webm (VP9) + {id}.mp4 (H.264) + {id}-poster.webp. Sessiz (ses izi yok).
// Runtime bağımlılığı YOK — site statik dosyaları <video> ile oynatır. Tarayıcı: Remotion'ın headless shell'i (ilk koşuda iner).
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, ensureBrowser } from "@remotion/renderer";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "media", "video");
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ["hero-loop", "process-flow"];
// kalite/boyut: arka plan ve dekoratif şerit → yüksek sıkıştırma yeterli
const CRF = { webm: 40, mp4: 28 };
const POSTER_FRAME = { "hero-loop": 60, "process-flow": 150 };

fs.mkdirSync(OUT, { recursive: true });
await ensureBrowser();
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "remotion", "index.tsx") });

for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id });
  const t0 = Date.now();
  for (const [codec, ext] of [["vp9", "webm"], ["h264", "mp4"]]) {
    const outputLocation = path.join(OUT, `${id}.${ext}`);
    await renderMedia({ composition, serveUrl, codec, outputLocation, crf: CRF[ext], muted: true, pixelFormat: "yuv420p", concurrency: 4 });
    console.log(`${id}.${ext}  ${(fs.statSync(outputLocation).size / 1024).toFixed(0)} KB`);
  }
  const poster = path.join(OUT, `${id}-poster.webp`);
  await renderStill({ composition, serveUrl, output: poster, frame: POSTER_FRAME[id] ?? 0, imageFormat: "webp" });
  console.log(`${id}-poster.webp  ${(fs.statSync(poster).size / 1024).toFixed(0)} KB  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
