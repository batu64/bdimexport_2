// cron-rss (FAZ_4 4.1) — saatlik RSS toplama. Dışa açık yönetim ucu YOK (secret gerekmez): yalnız /health.
// Elle tetik: yerelde `wrangler dev --test-scheduled` → GET /__scheduled; staging'de Cloudflare paneli → Triggers → "Trigger cron".
// TTL silme + bakım: 4.2 (gece job). Özet/etiket: 4.4 (enrich.ts; runtime AI = Gemini STUB, E3 — varsayılan KAPALI).
import type { Env } from "./types";
import { runIngest } from "./ingest";
import { isNightly, runMaintenance } from "./maintenance";
import { runEnrich } from "./enrich";

/** Saatlik iş: önce ingest (4.1), sonra yeni haberlerin özet/etiketi (4.4). Enrich asla fırlatmaz; ingest sonucunu etkilemez. */
async function hourly(env: Env, at: Date): Promise<void> {
  await runIngest(env, at);
  await runEnrich(env, at); // ENRICH_MODE=off (varsayılan) → no-op
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const at = new Date(controller.scheduledTime);
    // 4.2: gece cron'u (23:00 UTC) bakım job'ı; saatlik cron ingest. Ayrım cron ifadesiyle.
    ctx.waitUntil(isNightly(controller.cron) ? runMaintenance(env, at) : hourly(env, at));
  },

  async fetch(req: Request): Promise<Response> {
    const p = new URL(req.url).pathname;
    if (p === "/health") return new Response(JSON.stringify({ status: "ok", worker: "cron-rss" }), { headers: { "content-type": "application/json" } });
    return new Response("Not Found", { status: 404 });
  },
};
