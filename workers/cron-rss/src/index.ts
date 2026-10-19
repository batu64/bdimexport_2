// cron-rss (FAZ_4 4.1) — saatlik RSS toplama. Dışa açık yönetim ucu YOK (secret gerekmez): yalnız /health.
// Elle tetik: yerelde `wrangler dev --test-scheduled` → GET /__scheduled; staging'de Cloudflare paneli → Triggers → "Trigger cron".
// TTL silme + bakım: 4.2 (gece job). Özet/etiket: 4.4. Bu worker AI çağırmaz.
import type { Env } from "./types";
import { runIngest } from "./ingest";

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runIngest(env, new Date(controller.scheduledTime)));
  },

  async fetch(req: Request): Promise<Response> {
    const p = new URL(req.url).pathname;
    if (p === "/health") return new Response(JSON.stringify({ status: "ok", worker: "cron-rss" }), { headers: { "content-type": "application/json" } });
    return new Response("Not Found", { status: 404 });
  },
};
