// Statik export önizleme sunucusu (yalnız yerel QA / Lighthouse): node scripts/serve-static.mjs [dizin=out] [port=3100]
// Cloudflare Pages davranışı: /yol → yol.html, /yol/ → yol/index.html, yoksa 404.html. Bağımlılık yok.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? "out");
const PORT = Number(process.argv[3] ?? 3100);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm",
};
const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, "");
  const base = join(ROOT, safe);
  if (!base.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  for (const cand of [base, `${base}.html`, join(base, "index.html")]) {
    if (await isFile(cand)) {
      res.writeHead(200, { "content-type": TYPES[extname(cand)] ?? "application/octet-stream" });
      res.end(await readFile(cand));
      return;
    }
  }
  res.writeHead(404, { "content-type": TYPES[".html"] });
  res.end(await readFile(join(ROOT, "404.html")).catch(() => "404"));
}).listen(PORT, () => console.log(`static: ${ROOT} → http://localhost:${PORT}`));
