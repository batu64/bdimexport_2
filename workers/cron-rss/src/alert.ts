// FAZ_4 4.7 — hat alert'leri (webhook). Otomasyon gece insan görmezken çalışır: sessiz hata = sessiz içerik kaybı.
//   - Hedef: PIPELINE_ALERT_WEBHOOK_URL (Workers SECRET — URL secret içerir; ayarlar paneline yazılmaz, 3.8 kuralı).
//     Gövde Slack (`text`) + Discord (`content`) uyumlu. URL yalnız genel https (SSRF/kimlik bilgisi reddi — publicHttpsUrl).
//   - SPAM ÖNLEME: aynı `key` için 1 saatte en fazla 1 bildirim. Kayıt append-only admin_actions'a (action='pipeline_alert',
//     entity_id=key) → hem tekilleştirme hem iz; webhook tanımlı değilse de kayıt düşer (yalnız log'a yazılır).
//   - Alert metni hiçbir zaman ham kullanıcı/RSS/model metni, kişisel veri veya secret içermez: çağıranlar yalnız kod/sayı geçirir;
//     burada ayrıca URL/e-posta deseni maskelenir ve uzunluk sınırlanır.
//   - Alert gönderimi ASLA hattı durdurmaz (her hata yutulur + log).
import type { Env } from "./types";
import { sqlTime } from "./ingest";
import { ulid } from "../../../app/admin/audit";
import { publicHttpsUrl } from "../../../app/admin/settings/schema.ts";

export const ALERT_WINDOW_MS = 3_600_000;
export type AlertResult = "sent" | "logged" | "suppressed" | "error";

export interface PipelineAlert {
  key: string;
  level: "info" | "warn" | "error";
  title: string;
  details: string;
}

const clean = (s: string, max: number) =>
  s.replace(/https?:\/\/\S+/gi, "[url]").replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[e-posta]").replace(/[\u0000-\u001f]/g, " ").slice(0, max);

export async function sendAlert(env: Env, now: Date, a: PipelineAlert, fetchImpl: typeof fetch = fetch): Promise<AlertResult> {
  const key = clean(a.key, 120);
  try {
    const since = sqlTime(now.getTime() - ALERT_WINDOW_MS);
    const dup = await env.DB.prepare(
      "SELECT 1 AS x FROM admin_actions WHERE action = 'pipeline_alert' AND entity_type = 'alert' AND entity_id = ? AND created_at > ? LIMIT 1",
    ).bind(key, since).first();
    if (dup) {
      console.log(JSON.stringify({ evt: "alert_suppressed", key }));
      return "suppressed";
    }
    let delivered = false;
    let target: string | null = null;
    if (env.PIPELINE_ALERT_WEBHOOK_URL) {
      try { target = publicHttpsUrl(env.PIPELINE_ALERT_WEBHOOK_URL, "PIPELINE_ALERT_WEBHOOK_URL"); }
      catch { console.error(JSON.stringify({ evt: "alert_webhook_invalid" })); }
    }
    const icon = a.level === "error" ? "🚨" : a.level === "warn" ? "⚠️" : "ℹ️";
    const text = `${icon} bdimexport içerik hattı — ${clean(a.title, 160)}\n${clean(a.details, 800)}\n(${now.toISOString()} · ${key})`;
    if (target) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 5000);
      try {
        const r = await fetchImpl(target, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, content: text }), signal: ctl.signal });
        delivered = r.ok;
        if (!r.ok) console.error(JSON.stringify({ evt: "alert_webhook_http", status: r.status }));
      } catch {
        console.error(JSON.stringify({ evt: "alert_webhook_failed" })); // URL log'a YAZILMAZ (secret)
      } finally { clearTimeout(timer); }
    } else {
      console.warn(JSON.stringify({ evt: "pipeline_alert", level: a.level, key, title: clean(a.title, 160), details: clean(a.details, 800) }));
    }
    // İz + tekilleştirme kaydı (created_at = hat saati; teslim edilemese de kaydedilir → arızalı webhook'a saatte bir dener)
    await env.DB.prepare(
      "INSERT INTO admin_actions (id, actor, action, entity_type, entity_id, old_value, new_value, created_at) VALUES (?, 'system:pipeline', 'pipeline_alert', 'alert', ?, NULL, ?, ?)",
    ).bind(ulid(now.getTime()), key, JSON.stringify({ level: a.level, title: clean(a.title, 160), delivered, channel: target ? "webhook" : "log" }), sqlTime(now.getTime())).run();
    return target ? (delivered ? "sent" : "error") : "logged";
  } catch (e) {
    console.error(JSON.stringify({ evt: "alert_error", msg: e instanceof Error ? e.message.slice(0, 100) : "?" }));
    return "error";
  }
}
