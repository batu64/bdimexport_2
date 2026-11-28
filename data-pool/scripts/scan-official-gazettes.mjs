// Günlük Resmi Gazete & ABD Federal Register Otomatik Tarayıcı (İnsan Onay Kapılı)
// Yakalanan yeni ticaret/gümrük kararlarını PocketBase `regulatory_alerts` tablosuna
// `approval_status = "pending_admin_review"` statüsüyle ekler. Admin onaylayana kadar halka açılmaz!
const PB_URL = (process.env.PB_URL || "http://127.0.0.1:8090").replace(/\/+$/, "");
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error("PB_ADMIN_EMAIL ve PB_ADMIN_PASSWORD ortam değişkenleri gereklidir.");
  process.exit(1);
}

const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
});
if (!authRes.ok) throw new Error(`PocketBase auth hatası: ${authRes.status}`);
const { token } = await authRes.json();

// 1. ABD Federal Register yeni kararlar taraması
const frRes = await fetch(
  "https://www.federalregister.gov/api/v1/documents.json?per_page=10&order=newest&conditions[term]=antidumping+duty+OR+countervailing+duty+OR+section+301",
  { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(25000) }
);
const frJson = frRes.ok ? await frRes.json() : { results: [] };

// 2. T.C. Resmi Gazete ana sayfa günlük fihrist taraması
const rgCandidates = [];
try {
  const rgRes = await fetch("https://www.resmigazete.gov.tr", {
    headers: { "User-Agent": "BdimexportTradeRadar/1.0 (+https://bdimexport.com)" },
    signal: AbortSignal.timeout(20000),
  });
  if (rgRes.ok) {
    const html = await rgRes.text();
    const linkMatches = [...html.matchAll(/<a[^>]+href=["']([^"']+\.(?:htm|pdf))["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const KEYWORDS = /(İthalatta Gözetim|İlave Gümrük Vergisi|Haksız Rekabetin Önlenmesi|İthalat Rejimi|Tarife Kontenjanı|Korunma Önlemleri|Ürün Güvenliği ve Denetimi)/i;
    for (const m of linkMatches) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (KEYWORDS.test(text)) {
        const hsHits = [...new Set((text.match(/\b[0-9]{4}(?:\.[0-9]{2})?\b/g) || []).filter((x) => Number(x.slice(0, 4)) < 9800))];
        const slugHash = Buffer.from(href).toString("base64url").slice(-16);
        rgCandidates.push({
          alert_code: `TR_RG_AUTO_${slugHash}`,
          source_code: "TR_RESMI_GAZETE",
          jurisdiction: "TR",
          measure_type: "official_gazette_candidate",
          published_date: new Date().toISOString().slice(0, 10),
          affected_hs_codes: hsHits.length > 0 ? hsHits : ["GENEL"],
          affected_origins: ["ALL"],
          title_tr: `Resmî Gazete Tespit Adayı: ${text.slice(0, 190)}`,
          summary_tr: `Otomatik günlük taramada tespit edildi. Lütfen orijinal Resmî Gazete metnini/PDF tablosunu kontrol edip GTİP listesini doğruladıktan sonra 'approved' yapın.`,
          official_url: href.startsWith("http") ? href : `https://www.resmigazete.gov.tr/${href.replace(/^\/+/, "")}`,
          impact_level: "high",
          approval_status: "pending_admin_review",
        });
      }
    }
  }
} catch (err) {
  console.warn("Resmî Gazete tarama uyarısı:", err.message);
}

const candidates = [
  ...rgCandidates,
  ...(frJson.results || []).map((doc) => ({
    alert_code: `US_FR_${doc.document_number}`.replace(/[^A-Za-z0-9_-]/g, "_"),
    source_code: "US_FEDERAL_REGISTER",
    jurisdiction: "US",
    measure_type: "antidumping_cvd_notice",
    published_date: String(doc.publication_date || new Date().toISOString().slice(0, 10)),
    affected_hs_codes: ["GENEL"],
    affected_origins: ["Global"],
    title_tr: `ABD Federal Register [${doc.document_number}]: ${String(doc.title || "").slice(0, 180)}`,
    summary_tr: String(doc.abstract || doc.title || "").slice(0, 750),
    official_url: String(doc.html_url || "https://www.federalregister.gov"),
    impact_level: "medium",
    approval_status: "pending_admin_review",
  })),
];

let inserted = 0;
for (const c of candidates) {
  const check = await fetch(
    `${PB_URL}/api/collections/regulatory_alerts/records?filter=(alert_code='${c.alert_code}')`,
    { headers: { Authorization: token } }
  );
  const checkJson = await check.json();
  if ((checkJson.items || []).length === 0) {
    await fetch(`${PB_URL}/api/collections/regulatory_alerts/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(c),
    });
    inserted++;
  }
}
console.log(`✔ Günlük tarama tamamlandı: ${inserted} yeni aday 'pending_admin_review' olarak PocketBase'e eklendi.`);
