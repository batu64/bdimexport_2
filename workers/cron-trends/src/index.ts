// cron-trends (FAZ_4 4.3) — günlük Google Trends toplama (geo=TR/RU/DE). Dışa açık yönetim ucu YOK: yalnız /health.
// Elle tetik: yerelde `wrangler dev --test-scheduled` → GET /__scheduled; staging'de Cloudflare paneli → Triggers → "Trigger cron".
// Bu worker AI çağırmaz. Secret gerekmez.
import { runTrends, TRENDS_CRON, type Env } from "./trends";

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (controller.cron !== TRENDS_CRON) return;
    ctx.waitUntil(runTrends(env, new Date(controller.scheduledTime)));
  },

  async fetch(req: Request): Promise<Response> {
    const p = new URL(req.url).pathname;
    if (p === "/health") return new Response(JSON.stringify({ status: "ok", worker: "cron-trends" }), { headers: { "content-type": "application/json" } });
    return new Response("Not Found", { status: 404 });
  },
};
