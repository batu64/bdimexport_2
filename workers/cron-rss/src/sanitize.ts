// FAZ_4 4.4 — PROMPT INJECTION temizliği (DETERMİNİSTİK, model yok). Ham RSS metni modele ASLA ham girmez:
//   1) görünmez/kontrol/bidi/"tag" karakterleri atılır (ASCII-smuggling: U+E0000 bloğu, sıfır genişlikli, bidi override)
//   2) NFKC normalizasyonu (tam genişlikli/homoglif "ｉｇｎｏｒｅ" → "ignore") — tespit hile ile atlatılamasın
//   3) şablon/ayraç karakterleri (` < > { } | \) boşluğa çevrilir, boşluklar sıkıştırılır, uzunluk sınırlanır
//   4) yönerge benzeri metin tespit edilirse öğe KARANTİNAYA alınır → prompt'a hiç girmez (özet de üretilmez)
// SINIR (dürüstlük): regex listesi her saldırıyı yakalamaz. Savunma derinliği: sabit sistem talimatı + veri/talimat ayrımı (JSON)
// + modelde araç/secret yok + ÇIKTI doğrulaması (schema.ts: sıkı şema + yönerge/URL/HTML reddi) + insan onayı (onaysız yayın yok).

// Görünmez/biçim karakterleri SİLİNİR (kelimeyi bölerek tespiti atlatma "ig<ZWSP>nore" → "ignore"); kontrol/satır ayırıcı karakterler BOŞLUĞA çevrilir.
const DROP_RANGES: [number, number][] = [
  [0x200b, 0x200f], // sıfır genişlikli + yön işaretleri
  [0x202a, 0x202e], // bidi gömme/override
  [0x2060, 0x2064], [0x2066, 0x2069], // word-joiner, görünmez operatörler, bidi isolate
  [0xfeff, 0xfeff], // BOM / ZWNBSP
  [0xe0000, 0xe007f], // Unicode "tag" karakterleri (görünmez ASCII gizleme)
];
const SPACE_RANGES: [number, number][] = [
  [0x0000, 0x001f], [0x007f, 0x009f], // C0/C1 kontrol
  [0x2028, 0x2029], // satır/paragraf ayırıcı
];
const DELIMS = new Set(["`", "<", ">", "{", "}", "|", "\\"]);

const inRanges = (cp: number, r: [number, number][]) => r.some(([a, b]) => cp >= a && cp <= b);

/** Görünmez biçim karakterlerini siler, kontrol karakterlerini boşluğa çevirir. */
export function stripInvisible(s: string): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (inRanges(cp, DROP_RANGES)) continue;
    out += inRanges(cp, SPACE_RANGES) ? " " : ch;
  }
  return out;
}

export interface Sanitized {
  text: string;
  truncated: boolean;
}

export function sanitizeForPrompt(raw: string, maxChars = 200): Sanitized {
  const folded = stripInvisible(raw.normalize("NFKC"));
  let out = "";
  for (const ch of folded) out += DELIMS.has(ch) ? " " : ch;
  const text = out.replace(/\s+/g, " ").trim();
  const chars = [...text];
  return chars.length > maxChars ? { text: chars.slice(0, maxChars).join("").trim(), truncated: true } : { text, truncated: false };
}

// Yönerge benzeri kalıplar (EN/TR/DE/RU/ZH çekirdek). Metin sanitize + NFKC + küçük harf sonrası taranır.
const RULES: [string, RegExp][] = [
  ["ignore-previous", /\b(ignore|disregard|forget|override|bypass)\b.{0,30}\b(previous|prior|above|earlier|all|any|your|the|these)\b.{0,30}\b(instruction|prompt|rule|direction|command|context|guideline)s?\b/i],
  ["new-instructions", /\b(new|updated|real|actual|hidden)\s+(instruction|prompt|rule|task|directive)s?\b/i],
  ["system-prompt", /\b(system|developer)\s*(prompt|message|instruction)s?\b/i],
  ["role-hijack", /\b(you are now|from now on you|act as (a|an|the)\s+(system|admin|administrator|assistant|developer|root|dan)\b|pretend (to be|you are)|jailbreak|do anything now)/i],
  ["reveal-secret", /\b(reveal|print|show|leak|output|repeat|send|exfiltrate)\b.{0,40}\b(prompt|api[ _-]?key|secret|password|token|credential|instruction)s?\b/i],
  ["chat-template", /(\[\/?inst\]|<\|[a-z_]+\|>|\bim_(start|end)\b|###\s*(system|instruction|human|assistant)|\b(assistant|system|user)\s*:\s*$)/i],
  ["tr-ignore", /(önceki|yukarıdaki|tüm|bütün)\s+(talimat|komut|yönerge|kural)\w*.{0,20}(yok say|unut|görmezden|geçersiz)|(talimat|komut|yönerge)\w*\s+(yok say|unut|görmezden gel)|sistem\s+(istemi|komutu|talimatı)/i],
  ["de-ignore", /(ignoriere|vergiss|missachte)\b.{0,30}(anweisung|befehl|regel|prompt)|vorherige\w*\s+anweisung/i],
  ["ru-ignore", /(игнорируй|забудь|не\s+учитывай).{0,30}(инструкц|команд|правил|промпт)|предыдущ\w*\s+инструкц/i],
  ["zh-ignore", /(忽略|无视|忘记).{0,10}(之前|以上|所有|先前).{0,10}(指令|提示|规则|说明)|系统提示/],
  ["url-callback", /\b(visit|open|fetch|call|post to|send (it|this|data) to)\b.{0,30}https?:\/\//i],
];

/** Eşleşen kural kimliği ya da null. */
export function detectInjection(text: string): string | null {
  const t = stripInvisible(text.normalize("NFKC")).replace(/\s+/g, " ");
  for (const [id, re] of RULES) if (re.test(t)) return id;
  return null;
}
