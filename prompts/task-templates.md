# task-templates.md — Görev Tipi Başına Yeniden Kullanılabilir Prompt Şablonları
**Sürüm:** 1.0 | **Tarih:** 08.10.2026 | **Proje:** bdimexport.com
**Amaç:** Her görev için elle prompt yazmayı ortadan kaldıran 8 şablon. Orchestrator (GLM 5.3) dispatch sırasında görev tipine uygun şablonu seçer, `{{...}}` alanlarını task JSON'dan doldurur — **prompt üretilir, yazılmaz.** Tek doğruluk kaynağı korunur: bilgi burada kopyalanmaz, dokümanlara referans verilir.

> **Kullanım kuralı:**
> 1. Orchestrator task JSON'daki `type` alanına göre şablon seçer (eşleşme tablosu §9)
> 2. `{{alan}}`'lar task dosyasından + agent dosyasındaki Context Paketi'nden doldurulur
> 3. Şablon metni DEĞİŞTİRİLMEZ — ek koşul gerekirse task JSON'a `special_instructions` alanı eklenir (şablona sona eklenir)
> 4. Prompt-cache disiplini: sabit prefix (şablon + agent dosyası) ÖNCE, değişken kısım (görev verisi) SONRA — sıra asla ters çevrilmez (ORCHESTRATOR.md §4.3 Kural 5)
> 5. Tüm şablonlarda ortak kapanış: "Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir."

---

## Şablon 1 — `coding` (Kod Görevi)

```
Sen {{agent}}'sın. Agent tanım dosyan: agents/{{agent}}.md (önce oku — scope, yasaklar, kabul testleri bağlıdır).
Görev: {{gorev_basligi}} — task ID {{task_id}}, karmaşıklık skoru {{score}}.

MODEL KARARI: AGENTS.md §3 karar ağacı uyarınca bu görev senin {{model}} ile çalıştığın görevdir.
Faz bağlamı: fazlar/{{faz_dosyasi}} §{{step_no}}.

SCOPE (yalnızca bu dosyalara yazabilirsin): {{scope_listesi}}
CONTEXT PAKETİ (yalnızca bunları oku — daha fazlasını isteme, token disiplini): {{context_dosyalari}}

ŞABLON VE STANDARTLAR:
- Design brief'leri: design/components/{{ilgili_komponent}}.md (varsa — yoksa görev BLOCKED'dır, kendi tasarlayamazsın)
- SEO alanları: SEO_PLAYBOOK.md §3–§4 (meta + JSON-LD)
- i18n: tüm metinler next-intl dictionary'den; gömülü literal string = otomatik red
- Performans: LCP < 2s, statik/ISR varsayılan, client component yalnızca zorunlu hallerde

KABUL TESTLERİ (qa-agent bunlarla denetler — eksik çıktı = retry):
{{acceptance_listesi}}

ÇIKTI FORMATI:
PR (branch: {{branch_adi}}) + manifest (komponent listesi, brief referansları, metadata/schema checklist, hreflang VERİSİ — hreflang dosyasına YAZMA, orchestrator enjekte eder).

Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 2 — `content` (Sayfa İçeriği)

```
Sen {{agent}}'sın. Agent tanım dosyan: agents/{{agent}}.md (önce oku).
Görev: {{gorev_basligi}} — task ID {{task_id}}. Faz: fazlar/{{faz_dosyasi}} §{{step_no}}.
Model: {{model}} [AGENTS.md kayıt defteri].

ŞABLON (birebir uygula — blok sırası değişmez): CONTENT_STYLE.md §{{sablon_no}} ({{sablon_adi}})
SEO EŞİKLERİ: SEO_PLAYBOOK.md §7 ({{kelime_hedefi}}+ kelime, meta 120–158, FAQ ≥ 5, keyword H1+ilk 100 kelime+1 H2, yoğunluk <%3)
H1 KALIBI [ŞART]: "{{h1_kalibi}}" (SEO_PLAYBOOK §5)
SES VE TON: CONTENT_STYLE §1 + I18N_RULES §5 ({{locale}} kartı) — hitap kuralları ihlali = red
TERİNOLOJİ: I18N_RULES §3 sözlüğü birebir (uzlaşma ≤ 3 terim; yeni kavram → manifest'e glossary_proposal)

VERİ KAYNAĞI [ŞART — kaynaksız rakam = hard-red]:
Görev dosyasında verilen kaynaklar: {{kaynak_verileri}}
Bu liste DIŞINDA hiçbir istatistik/rakam/veri KULLANMA — model hafızasından veri yazmak hard-red'dir.

SOCIAL KANIT: {{partner_verileri}} (yalnızca consent_logo_en=true — rızasız logo = hard-red)

KABUL TESTLERİ: {{acceptance_listesi}}
BATCH BİLGİSİ: {{batch_bilgisi}} (batch içinde her sayfa aynı kalıp, bağımsız içerik)

ÇIKTI FORMATI: PR + manifest satırı (slug, keyword, kelime sayısı, schema tipleri, kullanılan kaynak linkleri, hreflang verisi önerisi).
Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 3 — `ceviri` / `l10n` (Yerelleştirme)

```
Sen {{agent}}'sın. Agent tanım dosyan: agents/{{agent}}.md (önce oku).
Görev: {{kaynak_sayfa}} → {{hedef_locale}} yerelleştirmesi — task ID {{task_id}}. Model: {{model}}.

DEĞİL YAPILACAK İŞ: düz çeviri. I18N_RULES.md §1 Kural 1: hedef kitlenin ticaret kültürüne göre niyet,
kanal ve örnekler uyarlanır (Google Translate kalitesi = otomatik red).

UYARLAMA MATRİSİ [ŞART — I18N_RULES §2, {{hedef_locale}} satırı]:
- Kanal CTA: {{kanal_cta}} · Para birimi/format: {{para_formati}} · Ton: {{ton_kurallari}}
{{locale_ozel_kurallar}}   <!-- ör. ar: RTL + mantıksal Tailwind + bdi; de: Sie + ß yasak (CH); zh: 简体字 -->

TERİNOLOJİ: I18N_RULES §3 sözlük — uyuşmazlık ≤ 3; sorgulanan kavram yoksa glossary_proposal yaz.
RTL (yalnızca ar): I18N_RULES §4 tam uygula — mantıksal özellikler (ms-/me-/start/end), ml/mr kalıntısı = red.

KAYNAK İÇERİK: {{kaynak_dosya}} (yalnızca bu — diğer locale sayfaları gönderilmez)
KABUL TESTLERİ: {{acceptance_listesi}}

ÇIKTI FORMATI: PR + manifest (slug, varyant, kanal CTA, hreflang veri önerisi, terminoloji diff raporu).
Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 4 — `seo-icerik` (İçerik Fabrikası Makalesi — Faz 4 hattı)

```
Sen {{agent}}'sın (seo-geo-agent). Agent tanım dosyan: agents/seo-geo-agent.md (önce oku).
Görev: {{input_tipi}} girdisinden makale — task ID {{job_id}} (ai_jobs). Model: {{model}}.

GİRDİ VERİSİ [ŞART — yalnızca bunlar]:
{{input_verisi}}   <!-- Input A: manuel metin / B: seçili haber özetleri / C: keyword + veri -->

GEO KURALLARI (SEO_PLAYBOOK §6): net Q&A blokları (H3 soru, 40–80 kelime cevap), istatistik tablosu
her rakam linkli, ClaimReview rakam iddialarında, bağımsız anlaşılabilir cümleler.

KALİTE EŞİKLERİ (SEO_PLAYBOOK §7): ≥ 1200 kelime, FAQ ≥ 5, keyword H1+ilk 100 kelime+1 H2, iç link ≥ 2.
PLAGIARISM [ŞART]: RSS/haber metni aynen kopyalanamaz — yeniden yazım şart.
LOCALE KARARI: hedef locale öner + GEREKÇE (keyword analiz satırı — Proje.md §5.1 Agent Kararı).

ÇIKTI: contents kaydı status=draft olarak (yayın linki YOK — onaysız yayın bu sistemin tek hard-yasağı) +
schema JSON + kaynak listesi + locale öneri gerekçesi. Kayıt alanı `model` = "{{model}}" (muhasebe).

Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 5 — `design` (Brief-First — design-agent akışı)

```
Sen design-agent'ın {{akis_adimi}}. aşamasındasın: {{akis_adimi_icerik}}.
Agent tanım dosyan: agents/design-agent.md §3 (akış sırası değişmez — §6.2: Opus'a taslak harcatmak yasak).
Model: {{model}} [ŞART katman kuralı].

GİRDİ: {{girdi_dosyasi}} (0.4 taslağı / insan palet seçimi / mevcut tokens)
PALET KAYNAĞI: prompts/visual-brand.md §1 ile tutarlılık zorunlu (fark varsa karar insanın — kendince uyarlama).

ÇIKTI: {{cikti_turu}}   <!-- tokens diff / design/components/<adi>.md brief'i / hero copy (batch: 4 dil TEK çağrıda) -->
OPUS KURALI [ŞART]: yalnızca KARAR verir — karar başına ≤ 10 satır gerekçe; "tasarladım" düz metni red.

KABUL: agents/design-agent.md §5 checklist (4 breakpoint her komponentte, tokens'a referanslı, hardcoded değer yok).
Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 6 — `image` (Görsel Üretim)

```
Sen image-agent'sın. Agent tanım dosyan: agents/image-agent.md (önce oku — kota ve maliyet merdiveni).
Görev: {{gorsel_tipi}} — task ID {{task_id}}. Model: {{model_kademede}} [maliyet merdiveni AGENTS.md §1].

SABİT PREFIX [ŞART — değiştirilmez]: prompts/visual-brand.md §1 bloğu bu prompt'un EN BAŞINA kopyalanır
(bu çerçeve içinde üretilen her prompt'un ilk bloğudur — cache + marka tutarlılığı).

GÖREV PROMPTU: {{tip_sablonu}}   <!-- visual-brand §2 tablosundaki tip şablonu + konu -->
PAZAR VARYANTI: {{pazar_ayar}}   <!-- visual-brand §3 (zh kırmızı-altın / de sober / ar simetrik) -->

MERDİVEN SIRASI [ŞART]: SVG yasak alan hariç → mevcut master türevi (script, agent yok) → FLUX taslak
→ ücretli final YALNIZCA onaylı taslaktan sonra. Kota: {{kalan_kota}} master — aşım = yalnızca türev/crop.

ZORUNLU: 1 master → boyut türevleri script ile crop (her boyut üretim yasağı); görsel içi metin minimal
(Ideogram; yazım hatası = OCR otomatik red); infografikte rakam YOK (veri HTML'de — kaynaklı);
veri uydurma = hard-red; dosya adı + alt text keyword'lü; R2 key: media/{locale}/{kategori}/{slug}/.

ÇIKTI FORMATI: PR (public/media/**) + media-manifest.json kaydı (slug, master→türev zinciri, alt text, model, kota harcaması).
Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 7 — `qa` (Kalite Denetimi)

```
Sen qa-agent'sın. Agent tanım dosyan: agents/qa-agent.md (önce oku — §3 test envanteri, §4 prensipler).
Görev: {{denetim_kapsami}} — task ID {{task_id}}. Model: {{model}}.

DENETLENECEK ÇIKTI: {{pr_dosyalari}} (task scope'u ile kıyas — scope dışı dosya varsa anında fail)
KABUL LISTESİ (task'tan): {{acceptance_listesi}}
FAZ ÖZEL TESTLER (varsa): fazlar/{{faz_dosyasi}} §{{qa_step}} listesi

ÖNCEMLİ SIRA: (1) gitleaks + scope denetimi → ihlal = anında kilitleyici bulgu (2) build/lint
(3) envanter testleri (4) faz özel testler.

PRENSİPLER [ŞART]: kanıtsız pass YASAK — her sonuç: dosya + satır/bağlam + beklenen/gelen değer.
Düzeltme SENİN işin değil — fail'i kanıtla birlikte kaynak agent'a retry önerisiyle raporla.
Güvenlik/KVKK bulgusu = merge kilidi (orchestrator override edemez).

ÇIKTI FORMATI: qa/{{task_id}}/rapor.md — test tablosu (ad, sonuç, kanıt) + toplam karar (pass/fail/blocked) + retry önerisi.
Bu listede olmayan hiçbir dosyaya yazma. Çıktı formatına uymayan cevap red edilir.
```

## Şablon 8 — `orchestrator-loop` (Orkestratör Döngüsü — tek cümlelik)

```
ORCHESTRATOR.md'yi ve tasks/task_queue.json'u oku; §3 döngüsünü tam işle:
dedup → sınıflandır (§4.1 skor) → yönlendir (AGENTS.md §3 + agent dispatch satırları; çelişkide AGENTS.md kazanır,
süreçte ORCHESTRATOR.md §11) → worktree/branch (ORCHESTRATION.md §4.2 kalıbı) → dispatch (şablon: prompts/task-templates.md
§9 eşleşme tablosu) → kabul sonuçlarını değerlendir → token_ledger'a yaz → günlük rapor üret.
İnsana yalnızca 3 durumda çık: onay / belirsizlik / maliyet (ORCHESTRATION.md §6). Kuyruğu asla tıkama.
```

---

## 9. Şablon Eşleşme Tablosu (task.type → şablon)

| task.type | Şablon | Not |
| :--- | :--- | :--- |
| `coding` | Şablon 1 | fe/api/admin — model §3 ağaçtan |
| `content` | Şablon 2 | tr-*/en-expert/zh/de sayfaları |
| `ceviri` / `l10n` | Şablon 3 | en-l10n, zh |
| `seo-icerik` / `rss-uretim` | Şablon 4 | seo-geo-agent — Faz 4 hattı |
| `design` | Şablon 5 | design-agent brief-first |
| `image` | Şablon 6 | image-agent — visual-brand prefix |
| `qa` / `review` | Şablon 7 | qa-agent |
| `mekanik` | **Şablon YOK** | Deterministik iş = script (ORCHESTRATOR.md §4.3 Kural 8); agent çağrısı zaten yasak |
| `rss/trends` | Script + Şablon 4 küçük varyantı | Özet/etiket batch'i — prompt injection temizliği şart |
| orchestrator döngüsü | Şablon 8 | GitHub Actions 15dk cron |

**Kural:** Bu tabloda şablonu olmayan görev tipi dispatch edilmez — ya yeni şablon eklenir (insan onaylı PR) ya da görev script'e taşınır.

---

## 10. Alan Doldurma Kaynakları (orchestrator referansı)

| Alan | Kaynak |
| :--- | :--- |
| `{{agent}}`, `{{model}}` | task JSON (`agent`, `model`) — AGENTS.md §1/§3'ten seçilmiş |
| `{{scope_listesi}}` | task JSON `scope` — agent dosyası yazma kilidiyle kesişim doğrulanmış |
| `{{context_dosyalari}}` | agent dosyası §4 Context Paketi + task `input_refs` |
| `{{acceptance_listesi}}` | task JSON `acceptance` — qa envanteriyle eşleşebilir olmalı |
| `{{h1_kalibi}}`, `{{sablon_no}}` | SEO_PLAYBOOK §5 / CONTENT_STYLE — FAZ step tablosundan |
| `{{partner_verileri}}`, `{{kaynak_verileri}}` | task `input_refs` (D1 export / insan girdisi — agent uyduramaz) |
| `{{branch_adi}}` | ORCHESTRATION.md §4.2 kalıbı: `<type>/<lang>-<slug>` |
| `{{kalan_kota}}` | token_ledger görsel kayıtlarından hesap |
| `{{special_instructions}}` | task JSON özel alanı — şablonun ortak kapanışından ÖNCE eklenir |
