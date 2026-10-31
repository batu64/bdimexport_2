import type { Env } from "./types";
import { getYesterdayString, syncAnalyticsDay, syncWithBackfill } from "./sync";
import { runKeywordEngine } from "./keywords";

/** Sabit-zamanlı karşılaştırma (token sızıntısı için zamanlama farkı vermez). */
function tokenOk(req: Request, expected?: string): boolean {
  if (!expected) return false; // SYNC_TOKEN tanımsız → /sync kapalı
  const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${expected}`;
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return diff === 0;
}

export default {
  // Scheduled Cron Handler
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const at = new Date(controller.scheduledTime);
    // 6.3: sync bittikten (başarısız olsa da) sonra keyword motoru — veri yoksa no-op (anlık görüntü korunur)
    ctx.waitUntil(syncWithBackfill(env, at).catch((e) => console.error("sync failed:", e)).then(() => runKeywordEngine(env, at)));
  },

  // Manual HTTP Handler for testing & on-demand backfill trigger
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok", worker: "cron-analytics" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/sync" || url.pathname === "/api/sync") {
      // Dışa açık workers.dev URL'sinden anonim tetik YASAK: Bearer SYNC_TOKEN (Cloudflare Secret) zorunlu; yoksa kapalı.
      if (req.method !== "POST" || !tokenOk(req, env.SYNC_TOKEN)) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      const dayParam = url.searchParams.get("day");
      const targetDay = dayParam ?? getYesterdayString();

      // Simple regex check YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDay)) {
        return new Response(
          JSON.stringify({ error: "Invalid day format, expected YYYY-MM-DD" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const res = await syncAnalyticsDay(env, targetDay);
      return new Response(JSON.stringify(res), {
        status: res.success ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
