# Bdimexport — Model Erişim Mimarisi (Tek Kaynak: Nous Portal)
**Tarih:** 08.10.2026 | **Karar:** FAZ_0 sonrası onaylandı (insan) — "tek tek API almak istemiyorum, Nous bunun için alınmıştı"

## Karar

Tüm agent model çağrıları **Nous Portal aboneliği üzerinden** yapılır — provider başına API key TOPLANMAZ.

```
Agent'lar / Orchestrator / Workflow'lar
        │  (OpenAI-uyumlu çağrı, placeholder bearer)
        ▼
hermes proxy  (http://127.0.0.1:8645/v1)   ← yerel credential-broker
        │  (gerçek Portal bearer — auth.json'dan)
        ▼
Nous Portal inference-api  →  432 model kataloğu
```

## Çalışma Modları

| Mod | Erişim | Ne zaman |
| :--- | :--- | :--- |
| **Yerel geliştirme** | `hermes proxy start --provider nous` → localhost:8645/v1 (key: placeholder) | FAZ_1–9 tüm yerel çalışma |
| **CI (GitHub Actions)** | Portal **static API key** → GitHub Secrets (`NOUS_API_KEY`), base_url: `https://inference-api.nousresearch.com/v1` | FAZ_1'de CI devreye girince (tek key, tek çatı) |

## Doğrulanmış Model Eşlemesi (ping 9/9 — tasks/ping-report.json)

| Kayıt defteri adı | Portal ID | Durum |
| :--- | :--- | :--- |
| GLM 5.3 (orchestrator) | `z-ai/glm-5.3-flash` | ✅ 3.0s |
| Claude Sonnet 5.5 | `anthropic/claude-sonnet-5.5` | ✅ 1.7s |
| Claude Opus 5 | `anthropic/claude-opus-5` | ✅ 2.2s |
| Qwen 3.8 | `qwen/qwen3.8-max-prime` | ✅ (flash varyantı upstream capacity 429 — geçici) |
| Qwen 3.8 Max | `qwen/qwen3.8-max-0902` | ✅ 2.1s |
| Gemini Argon 4 → **eşdeğer: gemini-3.8-flash** | `google/gemini-3.8-flash` | ✅ 2.5s |
| Gemini Flash | `google/gemini-3.8-flash` | ✅ |
| Gemini Flash-Lite | `google/gemini-3.5-flash-lite` | ✅ 1.3s |
| Gemini 3.8 Flash | `google/gemini-3.8-flash` | ✅ |
| Workers AI | Cloudflare token ile (proxy dışı — mevcut credential) | ✅ |
| Görseller | `google/gemini-3-pro-image` Portal'da VAR; ChatGPT Image/Ideogram/FLUX FAZ_2 öncesi test | ⏳ |

## Kurallar

1. Provider key toplanmaz — ihtiyaç halinde Portal API key (tek) eklenir, değilse proxy
2. AGENTS.md kayıt defterindeki `portal_id` yetkilidir; kodlar bu ID'yi kullanır
3. 429 "upstream capacity" = geçici üst akış yoğunluğu → retry (key limiti DEĞİL) — ORCHESTRATION.md §6 retry zinciri uygulanır
4. Proxy süreci: geliştirme oturumlarında çalışır durumda tutulur; otomatik başlatma FAZ_1'de kararlaştırılır (Windows servisi veya başlangıç görevi)
5. Portal key kullanılırsa (CI): rate limit abonelik kademesine göre — token_ledger'a yine yazılır

## Değişiklik Günlüğü
- 08.10.2026: İlk kurulum, ping 9/9, mimari onaylandı (insan)
