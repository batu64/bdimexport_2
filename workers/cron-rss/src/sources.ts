// RSS kaynak DEPOLAMA okuma (ERTELENEN C4): kaynaklar `settings` tablosunda `rssSources` anahtarında (JSON) tutulur;
// admin panelinden (3.8 Ayarlar → "RSS kaynakları", 3.6 Input B ile ORTAK) yazılır, bu worker YALNIZ OKUR.
// Defense-in-depth: admin şeması zaten doğrular ama burada HER öğe yeniden doğrulanır (D1 elle/yanlış yazılmış olsa bile SSRF/iç adres çekilmez).
import type { SourceDef } from "./types";
import { validateRssSources } from "../../../app/admin/settings/schema.ts";

export const SETTINGS_KEY = "rssSources";

export async function loadSources(db: D1Database): Promise<{ sources: SourceDef[]; invalid: number }> {
  const row = await db.prepare("SELECT value_json FROM settings WHERE key = ?").bind(SETTINGS_KEY).first<{ value_json: string }>();
  if (!row) return { sources: [], invalid: 0 };
  let list: unknown;
  try {
    list = JSON.parse(row.value_json);
  } catch {
    console.error(JSON.stringify({ evt: "rss_sources_corrupt" }));
    return { sources: [], invalid: 0 };
  }
  if (!Array.isArray(list)) return { sources: [], invalid: 0 };
  const sources: SourceDef[] = [];
  const seenUrl = new Set<string>();
  let invalid = 0;
  for (const entry of list) {
    try {
      const [ok] = validateRssSources([entry]); // her öğe tek başına: biri bozuksa diğerleri akar
      if (!ok.enabled || seenUrl.has(ok.url)) continue;
      seenUrl.add(ok.url);
      sources.push(ok);
    } catch (e) {
      invalid++;
      console.error(JSON.stringify({ evt: "rss_source_invalid", reason: e instanceof Error ? e.message.slice(0, 120) : "?" }));
    }
  }
  return { sources, invalid };
}
