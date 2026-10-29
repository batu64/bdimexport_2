// Statik export önizleme sunucusu (yalnız yerel QA / Lighthouse): node scripts/serve-static.mjs [dizin=out] [port=3100]
// Cloudflare Pages davranışı: /yol → yol.html, /yol/ → yol/index.html, yoksa 404.html; metin türleri brotli/gzip (CF gibi —
// Lighthouse aktarım boyutunu ölçer, sıkıştırmasız sunum puanı haksız düşürür). Bağımlılık yok.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

const ROOT = resolve(process.argv[2] ?? "out");
const PORT = Number(process.argv[3] ?? 3100);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm",
};
const COMPRESS = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".svg"]);
function send(req, res, status, file, body) {
  const ext = extname(file);
  const headers = { "content-type": TYPES[ext] ?? "application/octet-stream", vary: "accept-encoding" };
  const ae = String(req.headers["accept-encoding"] ?? "");
  if (COMPRESS.has(ext) && /\bbr\b/.test(ae)) { res.writeHead(status, { ...headers, "content-encoding": "br" }); res.end(brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })); return; }
  if (COMPRESS.has(ext) && /\bgzip\b/.test(ae)) { res.writeHead(status, { ...headers, "content-encoding": "gzip" }); res.end(gzipSync(body)); return; }
  res.writeHead(status, headers);
  res.end(body);
}
const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, "");
  const base = join(ROOT, safe);
  if (!base.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  for (const cand of [base, `${base}.html`, join(base, "index.html")]) {
    if (await isFile(cand)) {
      send(req, res, 200, cand, await readFile(cand));
      return;
    }
  }
  const nf = join(ROOT, "404.html");
  send(req, res, 404, nf, await readFile(nf).catch(() => Buffer.from("404")));
}).listen(PORT, () => console.log(`static: ${ROOT} → http://localhost:${PORT}`));
