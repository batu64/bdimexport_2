// FAZ_4 4.4 — yeni rss_news → özet + etiket (batch 20). Akış (hepsi DETERMİNİSTİK, model çağrısı tek noktada: model.enrich):
//   aday seç (summary IS NULL, TTL içinde, deneme<3, karantinada değil) → sanitize (sanitize.ts) → yönerge benzeri ise KARANTİNA (prompt'a girmez)
//   → 20'lik batch → model (sabit talimat + JSON veri) → ÇIKTI doğrulaması (schema.ts, öğe bazında) → D1 UPDATE (summary + tags_json birleştir).
// Kurallar: model hatası → hiçbir şey yazılmaz, o çalışma durur (fail-closed, kaynağı yormaz); doğrulaması geçmeyen öğe yazılmaz (deneme++, 3'te bırakılır);
// UPDATE … WHERE summary IS NULL (idempotent/yarışsız); mevcut tags (örn. kind=trends) KORUNUR; çıktı ASLA yayına gitmez (yalnız admin havuzu — onay insanda).
import type { Env } from "./types";
import { buildBatchRequest, type PromptItem } from "./prompt";
import { ModelNotConfigured, selectEnrichFallback, selectModel, type EnrichModel } from "./model";
import { callWithQuota, QuotaPaused } from "./quota";
import { sendAlert } from "./alert";
import { validateBatch, type Reject } from "./schema";
import { detectInjection, sanitizeForPrompt } from "./sanitize";
import { sqlTime } from "./ingest";

const int = (v: string | undefined, def: number, min: number, max = Number.MAX_SAFE_INTEGER) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : def;
};

export interface EnrichSummary {
  mode: string;
  candidates: number;
  quarantined: number;
  sent: number;
  batches: number;
  enriched: number;
  rejected: number; // model çıktısı şemadan/yönerge denetiminden geçmedi
  model_error?: string;
}

interface Row {
  id: string;
  title: string;
  tags_json: string | null;
}

const parseTags = (s: string | null): Record<string, unknown> => {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const JV = "CASE WHEN json_valid(tags_json) THEN"; // bozuk JSON json_extract'ı patlatır → önce json_valid

export async function runEnrich(env: Env, now = new Date(), modelOverride?: EnrichModel | null, fallbackOverride?: EnrichModel | null): Promise<EnrichSummary> {
  const out: EnrichSummary = { mode: (env.ENRICH_MODE ?? "off").toLowerCase(), candidates: 0, quarantined: 0, sent: 0, batches: 0, enriched: 0, rejected: 0 };
  try {
    const model = modelOverride === undefined ? selectModel(env) : modelOverride;
    if (!model) return out; // ENRICH_MODE=off → no-op
    out.mode = model.name;
    const fallback = fallbackOverride === undefined ? selectEnrichFallback(env) : fallbackOverride;

    const batchSize = int(env.ENRICH_BATCH_SIZE, 20, 1, 20);
    const perRun = int(env.ENRICH_MAX_PER_RUN, 100, 1, 1000);
    const maxAttempts = int(env.ENRICH_MAX_ATTEMPTS, 3, 1, 10);
    const nowSql = sqlTime(now.getTime());

    const { results } = await env.DB.prepare(
      `SELECT id, title, tags_json FROM rss_news
        WHERE summary IS NULL AND expires_at > ?
          AND COALESCE(${JV} json_extract(tags_json, '$.enrich_attempts') END, 0) < ?
          AND COALESCE(${JV} json_extract(tags_json, '$.enrich_state') END, '') <> 'quarantined'
        ORDER BY fetched_at ASC, id ASC LIMIT ?`,
    )
      .bind(nowSql, maxAttempts, perRun)
      .all<Row>();
    out.candidates = results.length;

    // 1) sanitize + karantina
    const clean: { row: Row; title: string }[] = [];
    const quarantine: D1PreparedStatement[] = [];
    for (const row of results) {
      const s = sanitizeForPrompt(row.title);
      // önce HAM metinde (ayraç karakterleri atılmadan: "<|im_start|>" gibi şablon belirteçleri), sonra temizlenmişte tara
      const hit = s.text.length < 3 ? "empty" : detectInjection(row.title) ?? detectInjection(s.text);
      if (hit) {
        out.quarantined++;
        const tags = { ...parseTags(row.tags_json), enrich_state: "quarantined", enrich_reason: hit };
        quarantine.push(env.DB.prepare("UPDATE rss_news SET tags_json = ? WHERE id = ? AND summary IS NULL").bind(JSON.stringify(tags), row.id));
        console.error(JSON.stringify({ evt: "enrich_quarantine", id: row.id, rule: hit })); // başlık LOGLANMAZ
      } else clean.push({ row, title: s.text });
    }
    for (let i = 0; i < quarantine.length; i += 50) await env.DB.batch(quarantine.slice(i, i + 50));

    // 2) batch'ler
    for (let i = 0; i < clean.length; i += batchSize) {
      const chunk = clean.slice(i, i + batchSize);
      const items: PromptItem[] = chunk.map((c, idx) => ({ id: idx, title: c.title }));
      let raw: unknown;
      try {
        raw = (await callWithQuota(env, now, model, fallback, (m) => m.enrich(buildBatchRequest(items)))).result; // 4.7 kota korumalı
      } catch (e) {
        // fail-closed: yazma yok, sonraki batch'ler denenmez (arızalı modeli/kotayı yormayalım); öğeler sonraki çalışmada yeniden aday
        out.model_error = e instanceof ModelNotConfigured ? "not_configured" : e instanceof QuotaPaused ? "quota_paused" : "call_failed";
        console.error(JSON.stringify({ evt: "enrich_model_error", kind: out.model_error, msg: e instanceof Error ? e.message.slice(0, 120) : "?" }));
        if (out.model_error === "call_failed") {
          await sendAlert(env, now, { key: "enrich_call_failed", level: "warn", title: "Haber özet/etiket modeli hata verdi", details: "Bu çalışmada özet yazılmadı; haberler sonraki saatlik çalışmada yeniden denenir." });
        }
        return out;
      }
      out.batches++;
      out.sent += chunk.length;
      const { ok, rejected } = validateBatch(raw, items.map((x) => x.id));

      const stmts: D1PreparedStatement[] = [];
      const enrichedAt = sqlTime(now.getTime());
      for (const [idx, e] of ok) {
        const row = chunk[idx].row;
        const base = parseTags(row.tags_json);
        delete base.enrich_attempts;
        delete base.enrich_state;
        delete base.enrich_reason;
        const tags = { ...base, sector: e.sector, product_candidate: e.product_candidate, locale_suggestion: e.locale_suggestion, urgency: e.urgency, model: model.name, enriched_at: enrichedAt };
        stmts.push(env.DB.prepare("UPDATE rss_news SET summary = ?, tags_json = ? WHERE id = ? AND summary IS NULL").bind(e.summary, JSON.stringify(tags), row.id));
      }
      for (const [idx, reason] of rejected) {
        const row = chunk[idx].row;
        const base = parseTags(row.tags_json);
        const attempts = Number(base.enrich_attempts ?? 0) + 1;
        const tags = { ...base, enrich_attempts: attempts, enrich_state: attempts >= maxAttempts ? "gave_up" : "retry", enrich_reason: reason as Reject };
        stmts.push(env.DB.prepare("UPDATE rss_news SET tags_json = ? WHERE id = ? AND summary IS NULL").bind(JSON.stringify(tags), row.id));
        console.error(JSON.stringify({ evt: "enrich_output_rejected", id: row.id, reason }));
      }
      for (let j = 0; j < stmts.length; j += 50) await env.DB.batch(stmts.slice(j, j + 50));
      out.enriched += ok.size;
      out.rejected += rejected.size;
    }
  } catch (e) {
    out.model_error = e instanceof ModelNotConfigured ? "not_configured" : "unexpected";
    console.error(JSON.stringify({ evt: "enrich_error", kind: out.model_error, msg: e instanceof Error ? e.message.slice(0, 120) : "?" }));
  }
  console.log(JSON.stringify({ evt: "enrich_run", ...out }));
  return out;
}
