# Baidu Hazırlığı ve Gönderim Rutini — /zh (FAZ_4 4.8)

**Sürüm:** 1.0 · 2026-10-27 · Opus 5.5 · **Uygulayan:** 👤 İNSAN (Baidu hesabı + doğrulama). Agent: sitemap + meta yeri + bu rehber.
**Durum:** Kod hazır, **hesap/doğrulama ERTELENDİ** (ERTELENEN_GOREVLER E9 → FAZ 5.5'te aktif). /zh şu an iskelet; Baidu'ya gönderim, /zh içeriği dolduktan sonra (FAZ 5) anlamlıdır.

> Kurallar (SEO_PLAYBOOK §9, agents/zh-agent.md): 简体字 only · title ≤ 30 Çince karakter · **ICP vaadi YOK** (site Cloudflare'de; .cn + ICP lisansı ayrı karar — FAZ 7.6) · Baidu doğrulama kodu repoya **yazılmaz** (build env).

---

## 1. Hazır olanlar (kod)

| Öğe | Yer | Durum |
| :-- | :-- | :-- |
| zh sitemap | `https://bdimexport.com/sitemaps/sitemap-zh.xml` (`app/sitemaps/sitemap-zh.xml/route.ts`) | Build'de var olan zh sayfalarından üretilir. Şu an yalnız `/zh`; FAZ 5.3 hizmet sayfaları (`content/zh/services/*.md`) eklendikçe kendiliğinden girer. Var olmayan URL yazılmaz. |
| Sitemap index | `https://bdimexport.com/sitemaps/sitemap-index.xml` | Ana sitemap + zh |
| robots.txt | `public/robots.txt` | `User-agent: Baiduspider Allow: /` + 3 `Sitemap:` satırı |
| Doğrulama meta yeri | `app/(zh)/layout.tsx` → `metadata.verification.other["baidu-site-verification"]` | Değer build env'inden: `NEXT_PUBLIC_BAIDU_SITE_VERIFICATION`. **Tanımlı değilse hiçbir meta basılmaz.** |

## 2. 👤 Baidu hesabı ve doğrulama (FAZ 5.5'te)

1. **Hesap:** `https://ziyuan.baidu.com` (百度搜索资源平台) → 注册 / 登录. Baidu hesabı Çin telefon numarası isteyebilir; yoksa (a) şirketin Çin'deki iş ortağının hesabıyla sahiplik doğrulaması, (b) bu adımı ertelemek seçenekleri var — karar senin.
2. **Site ekle:** 用户中心 → 站点管理 → 添加网站 → `https://bdimexport.com` (https seç). Site türü: 企业/商务.
3. **Doğrulama yöntemi:** **HTML标签验证** (meta etiketi) seç. Panel şuna benzer bir kod verir: `<meta name="baidu-site-verification" content="codeva-XXXXXXXX" />`.
4. **Kodu gir (repoya DEĞİL):** yalnız `content` değerini (`codeva-XXXXXXXX`) Cloudflare **Pages → bdimexport → Settings → Environment variables → Production** altına `NEXT_PUBLIC_BAIDU_SITE_VERIFICATION` olarak ekle → **Retry deployment**.
5. **Kontrol:** `curl -s https://bdimexport.com/zh | grep baidu-site-verification` → meta görünmeli. Sonra panelde **完成验证**.
   - Not: Baidu doğrulaması `bdimexport.com` alan adı ister. Custom domain (ERTELENEN E2) bağlanmadan `pages.dev` üzerinde doğrulama **yapılmaz** → bu adım E2'den sonra.

## 3. Sitemap gönderimi (rutin)

| Ne | Nerede | Sıklık |
| :-- | :-- | :-- |
| Sitemap ekle | 普通收录 → sitemap → `https://bdimexport.com/sitemaps/sitemap-zh.xml` | Bir kez (Baidu düzenli tekrar okur) |
| Durum kontrolü | 普通收录 → sitemap listesi: 状态 "正常", 抓取 sayısı | **Haftalık** (admin rutini, Pazartesi) |
| Yeni sayfa bildirimi | 普通收录 → 手动提交 (yeni zh URL'leri, satır başına bir) | zh'de yeni sayfa yayınlandıkça |
| Hata/erişim | 抓取诊断 (tarama tanısı) ile `/zh` | İlk kurulumda + aylık |

**Gelecek (opsiyonel, kod YOK):** Baidu "API提交" (`data.zz.baidu.com/urls?site=…&token=…`) yeni URL'leri otomatik bildirir. Token **secret**'tır (`BAIDU_PUSH_TOKEN`, Workers Secret); 4.6 yayın hattına bağlanması FAZ 5.5 / 8 kararı.

## 4. Erişim notu (Çin'den)
- Site Cloudflare global ağında; ICP lisansı olmadığı için Çin içi PoP kullanılmaz → Çin'den hız değişken olabilir. Ölçüm ve .cn/Aliyun mirror kararı **FAZ 7.6** (`reports/cn-degerlendirme.md`).
- Baidu, Google'dan farklı olarak JavaScript render etmeyebilir → /zh sayfaları **statik HTML** (static export) olarak sunulur; içerik HTML'de olmalı (istemci tarafı yüklenen metin taranmaz).

## 5. Kayıt (👤)
| # | Adım | Tarih | Sonuç |
| :-- | :-- | :-- | :-- |
| 1 | Baidu hesabı | | |
| 2 | Site eklendi + HTML etiketi kodu alındı | | |
| 3 | `NEXT_PUBLIC_BAIDU_SITE_VERIFICATION` Pages env + deploy | | |
| 4 | 完成验证 (doğrulandı) | | |
| 5 | sitemap-zh gönderildi, durum 正常 | | |
