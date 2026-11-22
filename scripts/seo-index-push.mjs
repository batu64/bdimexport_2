// Otomatik Arama Motoru & AI Dizin Gönderim Motoru (IndexNow API + Google Search Console Sitemaps v3 API).
// Kullanım: pnpm seo:push
// 1) IndexNow API (Bing, Yandex, ChatGPT Search, Copilot, Naver, Seznam): Anahtarsız/OAuth'suz, statik doğrulama dosyasıyla
//    out/sitemap.xml içindeki tüm canlı URL'leri tek API isteğiyle anında indeks kuyruğuna iter.
// 2) Google Search Console Sitemaps API (webmasters/v3): .env.local veya ortamda GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY
//    tanımlıysa 7 XML site haritasının tamamını doğrudan Google REST API (PUT) üzerinden otomatik gönderir.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const HOST = "bdimexport.com";
const SITE_URL = `https://${HOST}`;
const INDEXNOW_KEY = "88f4c2a1e94d47b0a3e2119c7b6d5041";
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

const SITEMAP_FEEDS = [
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/sitemaps/sitemap-index.xml`,
  `${SITE_URL}/sitemaps/sitemap-tr.xml`,
  `${SITE_URL}/sitemaps/sitemap-en.xml`,
  `${SITE_URL}/sitemaps/sitemap-markets.xml`,
  `${SITE_URL}/sitemaps/sitemap-de.xml`,
  `${SITE_URL}/sitemaps/sitemap-zh.xml`,
];

function loadDotEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}

function extractSitemapUrls() {
  const smPath = path.join(ROOT, "out", "sitemap.xml");
  if (!fs.existsSync(smPath)) {
    throw new Error("out/sitemap.xml bulunamadı. Önce 'pnpm build' çalıştırın.");
  }
  const xml = fs.readFileSync(smPath, "utf8");
  return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))];
}

async function pushIndexNow(urlList) {
  console.log(`\n[1/2] IndexNow API Gönderimi (${urlList.length} URL -> Bing, Yandex, ChatGPT Search, Copilot)...`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
  });
  const body = await res.text();
  if (res.status === 200 || res.status === 202) {
    console.log(`✔ IndexNow API KABUL EDİLDİ (HTTP ${res.status}): ${urlList.length} URL anında indeks kuyruğuna iletildi.`);
  } else {
    console.warn(`⚠ IndexNow API yanıtı: HTTP ${res.status} ${body}`);
  }
}

async function mintGoogleToken(clientEmail, privateKeyRaw) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/webmasters",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const unsigned = `${header}.${payload}`;
  const pem = privateKeyRaw.replace(/\\n/g, "\n");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(pem, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth hatası (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function pushGoogleSearchConsoleSitemaps() {
  console.log("\n[2/2] Google Search Console Sitemaps REST API (webmasters/v3)...");
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const gscSite = process.env.GSC_SITE_URL || `${SITE_URL}/`;

  if (!email || !key) {
    console.log(
      "ℹ Google Search Console API için .env.local içinde GOOGLE_SERVICE_ACCOUNT_EMAIL ve GOOGLE_PRIVATE_KEY tanımlı değil — atlandı.",
    );
    console.log(
      "  (Not: Google 2023 sonunda şifresiz /ping ucunu kapattı; API ile gönderim için GCP Service Account e-postasını Search Console -> Kullanıcılar ve İzinler'e eklemeniz yeterlidir.)",
    );
    return;
  }

  const token = await mintGoogleToken(email, key);
  const encSite = encodeURIComponent(gscSite);
  for (const feed of SITEMAP_FEEDS) {
    const encFeed = encodeURIComponent(feed);
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encSite}/sitemaps/${encFeed}`;
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Length": "0" },
    });
    if (res.ok || res.status === 204) {
      console.log(`✔ GSC API Gönderildi: ${feed}`);
    } else {
      console.warn(`✘ GSC API Hatası (${res.status}) [${feed}]: ${await res.text()}`);
    }
  }
}

async function main() {
  loadDotEnvLocal();
  const urls = extractSitemapUrls();
  await pushIndexNow(urls);
  await pushGoogleSearchConsoleSitemaps();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
