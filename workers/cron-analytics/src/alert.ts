import type { Env } from "./types";

export async function sendAlert(env: Env, subject: string, details: string): Promise<void> {
  if (!env.ANALYTICS_ALERT_WEBHOOK_URL) {
    console.warn(`[ALERT] ${subject}: ${details}`);
    return;
  }

  try {
    await fetch(env.ANALYTICS_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 **Analytics Sync Alert** 🚨\n**Subject:** ${subject}\n**Details:** ${details}\n**Time:** ${new Date().toISOString()}`,
      }),
    });
  } catch (err) {
    console.error("sendAlert failed:", err);
  }
}
