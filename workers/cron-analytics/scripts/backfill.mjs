#!/usr/bin/env node
/**
 * Backfill script for bdimexport analytics_daily.
 * Can be executed locally with wrangler or via Node against the local or remote worker.
 * Auth: SYNC_TOKEN env (worker'daki Secret ile aynı değer; koda/komuta YAZMA, ortam değişkeni olarak ver).
 * Usage:
 *   node scripts/backfill.mjs --days=7
 *   node scripts/backfill.mjs --day=2026-10-09
 */

const args = process.argv.slice(2);
let targetDays = [];

const dayArg = args.find((a) => a.startsWith("--day="));
const daysArg = args.find((a) => a.startsWith("--days="));

if (dayArg) {
  targetDays.push(dayArg.split("=")[1]);
} else {
  const count = daysArg ? parseInt(daysArg.split("=")[1], 10) : 1;
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    targetDays.push(d.toISOString().slice(0, 10));
  }
}

const token = process.env.SYNC_TOKEN;
if (!token) {
  console.error("SYNC_TOKEN ortam değişkeni gerekli (worker /sync artık POST + Bearer ister).");
  process.exit(1);
}
const baseUrl = process.env.CRON_ANALYTICS_URL || "http://localhost:8787";

console.log(`Starting backfill for ${targetDays.length} day(s):`, targetDays);

async function run() {
  for (const day of targetDays) {
    console.log(`Triggering backfill for ${day}...`);
    try {
      const res = await fetch(`${baseUrl}/sync?day=${day}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      console.log(`[${day}] status=${res.status}:`, body);
    } catch (err) {
      console.error(`[${day}] Failed to call ${baseUrl}/sync:`, err.message);
    }
  }
}

run();
