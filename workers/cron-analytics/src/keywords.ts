// FAZ_6 6.3 — keyword motoru tetikleyicisi: günlük sync'ten SONRA GSC sorgu×sayfa → deterministik fırsat skoru → D1 (keyword_opportunities).
// Motor: workers/api/src/keywords.ts (tek kaynak). AI içgörüsü (Gemini) yalnız KEYWORD_INSIGHTS_MODE != "off" iken ve 4.7 kota hattından
// (cron-rss/quota.ts callWithQuota — ai_usage_daily sayaçları, %80'de yedek model, ikisi doluysa durur) geçerek çağrılır. Varsayılan KAPALI; E3'e kadar gerçek çağrı YOK.
// Hiçbir koşulda fırlatmaz: motor hatası sync sonucunu etkilemez (alert + log).
import type { Env } from "./types";
import { refreshKeywordOpportunities, type RefreshResult } from "../../api/src/keywords";
import { callWithQuota } from "../../cron-rss/src/quota";
import { sendAlert } from "./alert";

export async function runKeywordEngine(env: Env, now: Date): Promise<RefreshResult | null> {
  try {
    const r = await refreshKeywordOpportunities(env.DB, now, env, (p, f, invoke) => callWithQuota(env, now, p, f, invoke));
    console.log(`keyword engine: ${r.status} rows=${r.rows} window=${r.window.from}..${r.window.to} insights=${r.insights}`);
    return r;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("keyword engine error:", msg);
    await sendAlert(env, "Keyword Engine Error", msg.slice(0, 200));
    return null;
  }
}
