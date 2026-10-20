// FAZ_4 4.4 — özet/etiket MODEL arayüzü. RUNTIME AI = Gemini → şimdilik STUB (ERTELENEN E3, AGENTS.md §3/§9).
//   ENRICH_MODE: "off" (VARSAYILAN — hiçbir şey yapılmaz) | "mock" (deterministik sahte çıktı; yerel/staging) | "gemini" (gerçek çağrı — HENÜZ YOK)
//   "gemini" seçilir ama anahtar/model yok ya da çağrı kodu yazılmadıysa → ModelNotConfigured → o çalışma YAZMAZ (fail-closed).
import type { Env } from "./types";
import type { BatchRequest } from "./prompt";

export class ModelNotConfigured extends Error {}

export interface EnrichModel {
  readonly name: string;
  /** Ham (GÜVENİLMEZ) yanıt döndürür; doğrulama schema.ts'te. */
  enrich(req: BatchRequest): Promise<unknown>;
}

/** Deterministik sahte model: başlıktaki anahtar sözcüklerden etiket üretir; özet "[MOCK]" ile başlar (gerçek özet DEĞİL). */
export class MockGeminiModel implements EnrichModel {
  readonly name = "mock";
  async enrich(req: BatchRequest): Promise<unknown> {
    const { items } = JSON.parse(req.data) as { items: { id: number; title: string }[] };
    return items.map((it) => {
      const t = it.title.toLowerCase();
      const sector = /tekstil|textile|apparel|fabric|konfeksiyon|garment/.test(t)
        ? "textile"
        : /gıda|food|zeytin|olive|fındık|hazelnut|agri/.test(t)
          ? "food"
          : /makine|machine|machinery|ekipman/.test(t)
            ? "machinery"
            : /çimento|cement|seramik|ceramic|tile|construction|inşaat|steel|çelik/.test(t)
              ? "construction"
              : /mobilya|furniture|home|ev tekstili|decor/.test(t)
                ? "home-living"
                : "other";
      const urgent = /acil|urgent|deadline|ban|yasak|tariff|gümrük vergisi/.test(t);
      return {
        id: it.id,
        summary: `[MOCK] ${it.title}`.slice(0, 200).padEnd(20, "."),
        sector,
        product_candidate: sector === "other" ? null : sector.replace("-", " "),
        locale_suggestion: sector === "food" ? ["en", "de"] : ["en", "tr"],
        urgency: urgent ? "high" : "normal",
      };
    });
  }
}

/**
 * GERÇEK Gemini (E3 — proje sonu). TODO(E3, AGENTS.md §9): burada `generateContent` çağrısı yazılacak:
 *   POST https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent  (başlık x-goog-api-key: GEMINI_API_KEY)
 *   body: { systemInstruction:{parts:[{text:req.system}]}, contents:[{role:"user",parts:[{text:req.data}]}],
 *           generationConfig:{ responseMimeType:"application/json", responseSchema:req.responseSchema, temperature:0 } }
 *   yanıt: candidates[0].content.parts[0].text → JSON.parse → (doğrulama schema.ts'te; burada DEĞİL).
 * Anahtar `wrangler secret put GEMINI_API_KEY --env <env>` ile girilir (👤, AGENTS §9); model adı GEMINI_MODEL var'ı. Kodda sabit YOK.
 */
export class GeminiModel implements EnrichModel {
  readonly name: string;
  constructor(private apiKey: string, model: string) {
    this.name = model;
  }
  async enrich(_req: BatchRequest): Promise<unknown> {
    void this.apiKey;
    throw new ModelNotConfigured("gemini_call_not_implemented (E3: proje sonunda yazılacak)");
  }
}

export function selectModel(env: Env): EnrichModel | null {
  const mode = (env.ENRICH_MODE ?? "off").toLowerCase();
  if (mode === "off") return null;
  if (mode === "mock") return new MockGeminiModel();
  if (mode === "gemini") {
    if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL) throw new ModelNotConfigured("GEMINI_API_KEY / GEMINI_MODEL tanımlı değil (E3)");
    return new GeminiModel(env.GEMINI_API_KEY, env.GEMINI_MODEL);
  }
  throw new ModelNotConfigured(`bilinmeyen ENRICH_MODE: ${mode.slice(0, 20)}`);
}

