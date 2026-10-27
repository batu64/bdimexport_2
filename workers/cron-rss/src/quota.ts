// FAZ_4 4.7 — runtime AI kota yönlendirmesi. Yalnız Gemini (AGENTS.md §3): fallback = AYNI sağlayıcının hızlı/ucuz
// varyantı (GEMINI_FALLBACK_MODEL), başka sağlayıcı YOK. (FAZ_4.md'deki "Workers AI'ya düş" ifadesi AGENTS.md §3 ile
// çelişir; AGENTS.md kazanır.)
//
// Karar (her çağrıdan ÖNCE, ai_usage_daily'den):
//   ana model: tükenmemiş VE (limit yok VEYA kullanım < limit × AI_QUOTA_WARN_RATIO [0.8])  → ana model
//   aksi: yedek model tanımlı, tükenmemiş VE (limit yok VEYA kullanım < limit)              → yedek  (+ alert "fallback", saatte 1)
//   aksi                                                                                    → QuotaPaused (çağrı YOK; + alert, saatte 1)
// Çağrı QuotaExceeded fırlatırsa (gerçek Gemini 429 RESOURCE_EXHAUSTED — E3) model o gün "tükendi" işaretlenir ve
// zincirdeki sonraki modelle AYNI istek bir kez daha denenir. Diğer hatalar failures++ ve çağırana iletilir (retry kararı onun).
import type { Env } from "./types";
import { sqlTime } from "./ingest";
import { sendAlert } from "./alert";

/** Gerçek model istemcisi 429/RESOURCE_EXHAUSTED'i buna çevirir (TODO(E3): GeminiModel / GeminiArticleModel). */
export class QuotaExceeded extends Error {}
/** Zincirdeki tüm modeller dolu → bu çalışmada model çağrısı yapılmaz. */
export class QuotaPaused extends Error {}

export interface Named { readonly name: string }

const dayOf = (now: Date) => now.toISOString().slice(0, 10);

function limit(v: string | undefined): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}
function ratio(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.8;
}

interface UsageRow { calls: number; failures: number; exhausted: number }
async function usage(env: Env, day: string, model: string): Promise<UsageRow> {
  const r = await env.DB.prepare("SELECT calls, failures, exhausted FROM ai_usage_daily WHERE day = ? AND model = ?").bind(day, model).first<UsageRow>();
  return r ?? { calls: 0, failures: 0, exhausted: 0 };
}
async function bump(env: Env, now: Date, model: string, col: "calls" | "failures" | "exhausted"): Promise<void> {
  const day = dayOf(now);
  const t = sqlTime(now.getTime());
  const set = col === "exhausted" ? "exhausted = 1" : `${col} = ${col} + 1`;
  const init = col === "calls" ? "1, 0, 0" : col === "failures" ? "0, 1, 0" : "0, 0, 1";
  await env.DB.prepare(
    `INSERT INTO ai_usage_daily (day, model, calls, failures, exhausted, updated_at) VALUES (?, ?, ${init}, ?) ` +
    `ON CONFLICT(day, model) DO UPDATE SET ${set}, updated_at = excluded.updated_at`,
  ).bind(day, model, t).run();
}

export interface QuotaDecision<M extends Named> { model: M; role: "primary" | "fallback" }

/** Sıradaki çağrının hangi modelle yapılacağı (veya hiç yapılmayacağı). */
export async function decide<M extends Named>(env: Env, now: Date, primary: M, fallback: M | null): Promise<QuotaDecision<M> | null> {
  const day = dayOf(now);
  const p = await usage(env, day, primary.name);
  const lp = limit(env.AI_DAILY_LIMIT);
  if (!p.exhausted && (lp === null || p.calls < lp * ratio(env.AI_QUOTA_WARN_RATIO))) return { model: primary, role: "primary" };
  if (fallback && fallback.name !== primary.name) {
    const f = await usage(env, day, fallback.name);
    const lf = limit(env.AI_FALLBACK_DAILY_LIMIT);
    if (!f.exhausted && (lf === null || f.calls < lf)) {
      await sendAlert(env, now, {
        key: `quota_fallback:${primary.name}`, level: "warn",
        title: "AI kota eşiği aşıldı — yedek modele geçildi",
        details: `ana model ${primary.name}: ${p.calls}${lp ? `/${lp}` : ""} çağrı${p.exhausted ? " (sağlayıcı kotası tükendi)" : ""} → ${fallback.name}`,
      });
      return { model: fallback, role: "fallback" };
    }
  }
  await sendAlert(env, now, {
    key: "quota_paused", level: "error",
    title: "AI kotası doldu — üretim kuyruğu durdu",
    details: `${primary.name}${fallback ? ` + ${fallback.name}` : ""} günlük kota dolu (${day} UTC). İşler pending kalır; kota sıfırlanınca kendiliğinden devam eder.`,
  });
  return null;
}

/**
 * Kota korumalı çağrı. invoke() yalnız seçilen modelle çalışır; QuotaExceeded → model tükendi işaretlenir + zincirde bir
 * sonrakiyle tekrar. Hiç model yoksa QuotaPaused. Dönüş: sonuç + gerçekten kullanılan model (contents.model muhasebesi).
 */
export async function callWithQuota<M extends Named, T>(env: Env, now: Date, primary: M, fallback: M | null, invoke: (m: M) => Promise<T>): Promise<{ result: T; used: M }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const d = await decide(env, now, primary, fallback);
    if (!d) throw new QuotaPaused("quota_paused");
    await bump(env, now, d.model.name, "calls");
    try {
      return { result: await invoke(d.model), used: d.model };
    } catch (e) {
      if (e instanceof QuotaExceeded) { await bump(env, now, d.model.name, "exhausted"); continue; }
      await bump(env, now, d.model.name, "failures");
      throw e;
    }
  }
  throw new QuotaPaused("quota_paused");
}

/** Gece raporu için: günün kullanım satırları. */
export async function usageForDay(env: Env, day: string): Promise<(UsageRow & { model: string })[]> {
  const r = await env.DB.prepare("SELECT model, calls, failures, exhausted FROM ai_usage_daily WHERE day = ? ORDER BY model").bind(day).all<UsageRow & { model: string }>();
  return r.results ?? [];
}
