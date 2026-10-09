# ORCHESTRATION.md — Görev Dağıtım Protokolü
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Amaç:** Orchestrator'ın (GLM 5.3) görevleri nasıl aldığını, sınıflandırdığını, dağıttığını, takip ettiğini ve raporladığını tanımlar. Tüm agent dosyaları (`agents/*.md`) bu protokole bağlıdır.

> **Çelişki hiyerarşisi:** ORCHESTRATOR.md §11 (değişmez kurallar) > AGENTS.md §7 (model kayıt) > bu dosya > agent dosyaları.
> **Uyumluluk:** Proje.md §4 (vibe coding orkestrasyonu) + mimari.md §8 ile birebir; oradaki `git worktree` + paralel agent modeli burada operasyonel kurallara çevrilir.

---

## 1. Dosyalar ve Veri Sözleşmeleri

### 1.1. Dizin

```
tasks/
├── task_queue.json        # tüm görevlerin kuyruğu (orchestrator tek yazıcı)
├── token_ledger.json      # çağrı muhasebesi (append-only)
├── active/                # dağıtılmış, devam eden görev dosyaları
├── done/                  # kabul edilen görev arşivi
└── blocked/               # insana çıkan görevler + gerekçe
```

### 1.2. Görev Dosyası Şeması (`tasks/<id>.json`) — ORCHESTRATOR.md §3 ile aynı

```json
{
  "id": "T-0007",
  "type": "coding | design | image | ceviri | seo-icerik | rss/trends | review | mekanik",
  "lang": "tr | zh | en | ru | fr | nl | es | ar | de | null",
  "scope": ["app/(en)/products/**", "content/en/global/**"],
  "score": 4,
  "agent": "fe-agent",
  "model": "qwen-3.8",
  "budget_tokens": 12000,
  "max_retries": 2,
  "depends_on": ["T-0003"],
  "acceptance": ["build+lint temiz", "schema geçerli", "H1 şablonu birebir"],
  "input_refs": ["Proje.md#32", "content/en/global/olive-oil.md"],
  "created_by": "orchestrator",
  "status": "pending | dispatched | in_review | accepted | failed | blocked | needs_human",
  "attempts": [{"ts": "...", "model": "...", "result": "fail", "reason": "..."}]
}
```

**Kurallar:**
- `id` sıralı, asla yeniden kullanılmaz
- `scope` agent dosyasındaki yazma kilidiyle **kesişmek zorunda**; kesişmiyorsa görev oluşturulamaz (dispatch öncesi doğrulama)
- `acceptance` her madde qa-agent envanterindeki bir teste bağlanabilir olmalı ("güzel olsun" gibi ölçüsüz madde yasak)
- `depends_on` dolu görev, bağımlılığı `accepted` olmadan dispatch edilmez

### 1.3. token_ledger.json Kaydı

```json
{"ts": "ISO8601", "task_id": "T-0007", "agent": "fe-agent", "model": "qwen-3.8",
 "in_tok": 0, "out_tok": 0, "cache_hit": true, "cost_est_usd": 0.00, "note": ""}
```
Görsel üretimde `in_tok/out_tok` yerine `{"images": N, "est_usd": X}` yazılır (AGENTS.md §7 Kural 5).

---

## 2. Görev Kaynağı (Kim Görev Açar?)

| Kaynak | Nasıl | Örnek |
| :--- | :--- | :--- |
| **Roadmap (Faz planı)** | Proje.md §9 (4 haftalık tempo) + mimari.md §10 + ROADMAP.md fazları görevlere bölünür; orchestrator her faz başında backlog'u kuyruğa yazar | Faz 2 → "EN ürün iskeleti", "20 ürün sayfası" |
| **Admin panel** | İçerik Fabrikası seçimleri, keyword girişleri → webhook ile kuyruğa | "hazelnut germany makalesi" |
| **Cron** | RSS/Trends/analitik rutinleri sabit görev olarak haftalık kuyruğa yazılır | rss-trends-agent rutinleri |
| **qa-agent fail'i** | Retry görevi otomatik açılır (aynı id, attempts++ ; yeni id gerekmez) | — |
| **İnsan** | needs_human çözümü sonrası elle görev | marka paleti onayı |

---

## 3. Sınıflandırma ve Puanlama (Özet — tam kural ORCHESTRATOR.md §4)

1. **Score (0–10):** +3 mimari/çoklu bileşen, +2 güvenlik/KVKK, +2 backend, +1 yeni sayfa, +1 hassas çeviri, −2 şablon tekrarı, −3 mekanik
2. **Yönlendirme:** task.type + score + lang → agent dosyasındaki dispatch satırı + AGENTS.md §3 karar ağacı. **İki kaynak çelişirse agent dosyasındaki dispatch satırı kazanır** (en güncel yerel karar).
3. **lang yoksa** (örn. tasarım, admin): agent dosyasındaki `dispatch` satırı tek belirleyici.

---

## 4. Paralellik ve Çakışma Yönetimi

### 4.1. Dosya Kilit Matrisi

Her agent'ın yazma kilidi kendi dosyasında beyanlıdır (agents/*.md §1 Scope). Orchestrator dispatch öncesi:
- Yeni görevin `scope`'u, **aktif (dispatched) görevlerin** scope'larıyla kesişiyorsa → görev beklemede (`status: pending`, not: "kilit çakışması")
- Ortak dosyalar (sitemap index, hreflang haritası, route group config, `public/llms.txt`) → **yalnızca orchestrator yazar**; agent çıktısındaki hreflang/sitemap verileri manifest'ten alınır, orchestrator enjekte eder

### 4.2. Worktree ve Branch İsimlendirme (değişmez kalıp)

```
worktree yolu:  .worktrees/<agent>/<task-id>-<slug>
branch adı:     <type>/<lang>-<slug>          # tip: feat|fix|content|design|qa
                feat/zh-wechat-qr
                content/en-ru-hazelnut-page
                fix/de-sie-regex
PR başlığı:     [T-0007][zh-agent][qwen-3.8] feat: WeChat QR bileşeni
```
- Her görev = 1 branch = 1 PR; birden fazla görev tek branch'e yazılamaz
- Agent kendi worktree'sinden çıkmaz; ana repo checkout'una dokunmaz
- Merge yetkisi yalnızca orchestrator'da; güvenlik-kritik PR'da merge önşartı insan onay kaydıdır

### 4.3. Dispatch Sırası

1. `depends_on`'u boş olanlar → paralel (farklı agent'lar)
2. Aynı agent'a düşen görevler → o agent için **seri** (tek worktree)
3. Aynı agent'a giden ≤5 küçük görev → batch görevine birleştir (ORCHESTRATOR.md §4.3 Kural 4; batch task dosyasında `scope` birleşik, `acceptance` maddeleri numaralı)
4. T3 (Opus) kotası doluysa tasarım görevleri Qwen 3.8 Max fallback'ine (AGENTS.md §1)

---

## 5. Review ve Merge Akışı

```
agent PR açar
  → qa-agent kalite kapısı (acceptance listesi + test envanteri)  → pass/fail
  → orchestrator diff review (score ≥ 7 → ikinci göz: Sonnet 5.5)
  → diff > 400 satır → parçalara böl, ilgili uzman agent'a ikinci göz
  → merge:
      kalıcı sayfa/kod      → main'e merge → Cloudflare Pages build (Git tabanlı yayın)
      geçici içerik         → contents tablosu status=approved → D1 edge render
      güvenlik-kritik       → İNSAN onayı olmadan merge YOK (ORCHESTRATOR.md §9)
```

**PR checklist (otomatik):**
- [ ] Scope denetimi: diff dosyaları ⊆ task.scope
- [ ] gitleaks temiz
- [ ] qa raporu `qa/<task-id>/rapor.md` ekte, karar pass
- [ ] Görsel PR'da: media-manifest.json var
- [ ] Çeviri PR'da: terminoloji diff raporu ekte (I18N_RULES.md)

---

## 6. Retry, Escalation ve İnsana Çıkış

ORCHESTRATOR.md §7 zinciri burada operasyonelleşir:

| Durum | Aksiyon |
| :--- | :--- |
| Zaman aşımı/kota | Aynı modelde 1 retry, gece dilimine schedule |
| Kalite red | Retry chain: T1 → T1(netleştirilmiş kriter) → T2 → insan; katman başına max 2 |
| Scope ihlali | Anında red; agent dosyasına "ihlal kaydı" notu; 3 ihlal = agent dosyası güncelleme görevi açılır |
| Hallusinasyon şüphesi | qa-agent doğrulaması; kanıtlanırsa anında red + retries bitmiş sayılır |
| needs_human | Görev `tasks/blocked/`'e taşınır + gerekçe; **kuyruk tıkmaz**, diğer görevler akar |

**İnsana çıkma gerekçeleri (yalnızca 3):** (1) onay — güvenlik PR'ı, hukuki metin, marka paleti, draft yayın; (2) belirsizlik — acceptance'i tanımlanamayan görev; (3) maliyet — bütçe kademesi %90+ ve T2 gerekli.

---

## 7. Otomasyon (GitHub Actions)

### 7.1. Orchestrator Döngüsü (15 dk)

```yaml
# .github/workflows/orchestrator.yml (özet)
on:
  schedule: [{cron: "*/15 * * * *"}]
  workflow_dispatch: {}
  repository_dispatch: {types: [admin-task]}   # Admin panel webhook'u
jobs:
  run:
    steps:
      - checkout (worktree'ler dahil)
      - run: orchestrator CLI
          # GLM 5.3: "ORCHESTRATOR.md + tasks/task_queue.json oku, döngüyü işle"
          # Tam döngü prompt'u: prompts/task-templates.md §Şablon 8
      - run: git push (task durumu + yeni branch'ler)
```

### 7.2. Diğer Rutinler

| Workflow | Tetik | İş |
| :--- | :--- | :--- |
| `qa-gate.yml` | her PR | qa-agent envanter testleri + gitleaks |
| `cron-rss.yml` (Workers) | saatlik | rss-trends-agent script'i (fetch/TTL) |
| `nightly.yml` | 02:00 TR | TTL silme, Gemini gece batch'leri, D1→R2 yedek (hafta) |
| `weekly-report.yml` | Pzt 09:00 | haftalık token/performans raporu |

### 7.3. Raporlar

- **Döngü raporu** (her 15 dk, log): işlenen görev, dağıtım tablosu (görev→agent→model), retry/blocked, token toplamı
- **Haftalık rapor** (insana): en pahalı 5 görev, cache-hit oranı (<%60 → prompt şablonu düzeltmesi görevi açılır), retry oranı (>%20 → ilgili agent dosyası revizyonu), blocked listesi, T3 kota kullanımı

---

## 8. Bütçe Kademeleri (ORCHESTRATOR.md §8 ile aynı, operasyonel)

| Günlük kullanım | Davranış |
| :--- | :--- |
| < %70 | Normal akış |
| %70–89 | Uyarı log; yeni T2 görevleri "maliyet gerekçesi" ister |
| %90–99 | T2 çağrıları needs_human'e düşer; T0/T1 akar |
| %100 | Yalnızca T0/T1 + cron rutinleri; T2/T3 kilitli |

Günlük sıfırlama: TR saati 00:00. Ücretsiz model kotaları (Gemini/Workers AI) gece dilimine (02:00–06:00) yığılır.

---

## 9. Faz 0 — İlk Çalıştırma Kontrol Listesi

- [ ] `tasks/` dizin yapısı + boş `task_queue.json` + `token_ledger.json`
- [ ] AGENTS.md §7 Kural 1 model ping testi → kayıt defteri güncelle
- [ ] `design/design-tokens.md` ilk üretimi (design-agent brief-first akışı, insan palet onayı)
- [ ] GitHub Actions workflow'ları + secret'lar (env olarak, prompt'a asla)
- [ ] Faz 1 backlog'u kuyruğa yazılır (Proje.md §9 Hafta 1: foundation görevleri)
- [ ] İlk döngü çalışır: en az 1 görev pending→dispatched→accepted tam tur

**Durum:** ORCHESTRATOR.md ✅ · AGENTS.md ✅ · agents/*.md ✅ (15) · bu dosya ✅ → sıradaki: SEO_PLAYBOOK.md, I18N_RULES.md, CONTENT_STYLE.md.
