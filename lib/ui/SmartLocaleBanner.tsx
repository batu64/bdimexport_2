"use client";
// SEO-Güvenli Akıllı Ülke & Dil Karşılama Bandı (Seçenek 1 — Sıfır Otomatik Yönlendirme, Sıfır CLS).
// - Arama motoru ve yapay zeka botlarında (Googlebot, OAI-SearchBot, PerplexityBot, WebDriver) HİÇ çalışmaz.
// - Ziyaretçinin IP ülkesini (sessionStorage önbellekli) + saat dilimi/tarayıcı dili yedeğini okur.
// - Ziyaretçi yanlış dildeki bir sayfaya düştüyse kendi ana dilinde tek tıkla doğru merkeze / eşdeğer ürün sayfasına geçiş önerir.
// - Test parametresi: herhangi bir URL'ye ?geo_preview=LY | US | DE | TR | CN | SN | FR | RU ekleyerek anında önizlenebilir.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Globe, X } from "lucide-react";
import { clarityEvent, claritySet } from "./clarity";
import s from "./smartlocale.module.css";

export type SiteLocaleCode =
  | "tr"
  | "en"
  | "de"
  | "zh"
  | "ru"
  | "fr"
  | "nl"
  | "es"
  | "ar"
  | "fi"
  | "sq"
  | "pl"
  | "ro"
  | "it";

type BannerSuggestion = {
  targetCode: string;
  href: string;
  lang: string;
  dir: "ltr" | "rtl";
  message: string;
  ctaLabel: string;
  dismissLabel: string;
};

const STORAGE_DISMISS_KEY = "bdim_locale_banner_v1";
const SESSION_GEO_KEY = "bdim_geo_country_v1";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 gün

const ARAB_COUNTRIES = new Set([
  "LY", "JO", "IQ", "SY", "LB", "PS", "EG", "SD", "DZ", "TN", "MA", "MR",
  "SA", "AE", "QA", "KW", "BH", "OM", "YE",
]);
const DACH_COUNTRIES = new Set(["DE", "AT", "CH", "LI"]);
const RU_COUNTRIES = new Set(["RU", "BY", "KZ", "KG"]);
const FR_COUNTRIES = new Set(["FR", "MC", "BE"]);
const ES_COUNTRIES = new Set(["ES", "MX", "CO", "AR", "CL", "PE", "EC", "UY", "CR", "PA", "DO", "GT"]);
const AFRICA_PRIORITY = new Set([
  "SN", "MZ", "GH", "CI", "NG", "KE", "TZ", "UG", "ZA", "AO", "CM", "CD", "ET", "ZM", "ZW", "MW", "GM", "GW",
]);

function isBotOrAutomation(): boolean {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|mediapartners|facebookexternalhit|whatsapp|perplexity|chatgpt|oai-search|claudebot|bingpreview/i.test(
    ua,
  );
}

function inferCountryFromClient(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const tzMap: Record<string, string> = {
      "Europe/Istanbul": "TR",
      "Asia/Istanbul": "TR",
      "Africa/Tripoli": "LY",
      "Asia/Amman": "JO",
      "Asia/Baghdad": "IQ",
      "Africa/Cairo": "EG",
      "Asia/Riyadh": "SA",
      "Asia/Dubai": "AE",
      "Africa/Algiers": "DZ",
      "Africa/Tunis": "TN",
      "Africa/Casablanca": "MA",
      "Africa/Dakar": "SN",
      "Africa/Maputo": "MZ",
      "Europe/Berlin": "DE",
      "Europe/Vienna": "AT",
      "Europe/Zurich": "CH",
      "Asia/Shanghai": "CN",
      "Asia/Chongqing": "CN",
      "Europe/Moscow": "RU",
      "Europe/Paris": "FR",
      "Europe/Amsterdam": "NL",
      "Europe/Madrid": "ES",
      "Europe/Rome": "IT",
      "Europe/Warsaw": "PL",
      "Europe/Bucharest": "RO",
      "Europe/Helsinki": "FI",
      "Europe/Tirane": "AL",
    };
    if (tzMap[tz]) return tzMap[tz];
    if (tz.startsWith("America/")) {
      const lang = (navigator.language || "").toLowerCase();
      if (lang === "en-us") return "US";
    }
  } catch {
    // ignore
  }
  const primaryLang = (navigator.language || "").toLowerCase();
  if (primaryLang.startsWith("tr")) return "TR";
  if (primaryLang.startsWith("ar")) return "ARAB";
  if (primaryLang.startsWith("de")) return "DE";
  if (primaryLang.startsWith("zh")) return "CN";
  if (primaryLang.startsWith("ru")) return "RU";
  return "";
}

async function detectVisitorCountry(): Promise<string> {
  try {
    const cached = sessionStorage.getItem(SESSION_GEO_KEY);
    if (cached && /^[A-Z]{2,4}$/.test(cached)) return cached;
  } catch {
    // sessionStorage kapalı olabilir
  }

  const fetchWithTimeout = async (url: string): Promise<Response> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1800);
    try {
      return await fetch(url, { signal: ctrl.signal, credentials: "omit", cache: "force-cache" });
    } finally {
      clearTimeout(timer);
    }
  };

  let code = "";
  try {
    const r1 = await fetchWithTimeout("https://api.country.is/");
    if (r1.ok) {
      const j = (await r1.json()) as { country?: string };
      if (j.country && /^[A-Z]{2}$/.test(j.country)) code = j.country;
    }
  } catch {
    // ikinci kaynağa geç
  }

  if (!code) {
    try {
      const r2 = await fetchWithTimeout("https://get.geojs.io/v1/ip/country.json");
      if (r2.ok) {
        const j2 = (await r2.json()) as { country?: string };
        if (j2.country && /^[A-Z]{2}$/.test(j2.country)) code = j2.country;
      }
    } catch {
      // yerel saat dilimi yedeğine geç
    }
  }

  if (!code) code = inferCountryFromClient();

  if (code) {
    try {
      sessionStorage.setItem(SESSION_GEO_KEY, code);
    } catch {
      // ignore
    }
  }
  return code;
}

function buildSuggestion(
  country: string,
  currentLocale: SiteLocaleCode,
  pathname: string,
): BannerSuggestion | null {
  if (!country) return null;
  const onPolesPage = pathname.includes("wooden-utility-poles");
  const onInspectionPage = pathname.includes("inspection") || pathname.includes("konteyner-yukleme") || pathname.includes("werkspruefung");
  const onSourcingPage = pathname.includes("/sourcing") || pathname.includes("/tedarik") || pathname.includes("/beschaffung");
  const onUsHub = pathname === "/en/us" || pathname.startsWith("/en/us/") || pathname.includes("us-procurement-partner") || pathname.includes("markets/united-states");
  const onGenericEnEntry = pathname === "/en" || pathname === "/en/";

  // 1. Türkiye (TR)
  if (country === "TR") {
    if (currentLocale === "tr") return null;
    const href = onInspectionPage ? "/ithalat/konteyner-yukleme-denetimi" : onSourcingPage ? "/ithalat/tedarik" : "/";
    return {
      targetCode: "tr",
      href,
      lang: "tr",
      dir: "ltr",
      message: "Türkiye'den bağlanıyorsunuz — Türkçe sitemize geçmek ister misiniz?",
      ctaLabel: "Türkçe'ye Geç",
      dismissLabel: "Burada Kal",
    };
  }

  // 2. Arap Coğrafyası (Başta Libya & Ürdün + MENA)
  if (ARAB_COUNTRIES.has(country) || country === "ARAB") {
    if (currentLocale === "ar") return null;
    const href = onPolesPage
      ? "/en/ar/wooden-utility-poles"
      : onInspectionPage
      ? "/en/ar/services/inspection"
      : onSourcingPage
      ? "/en/ar/services/sourcing"
      : "/en/ar";
    const message =
      country === "LY"
        ? onPolesPage
          ? "مرحباً بكم من ليبيا — انتقلوا إلى صفحة أعمدة الكهرباء الخشبية باللغة العربية."
          : "مرحباً بكم من ليبيا — هل ترغبون في تصفح النسخة العربية؟"
        : country === "JO"
        ? onPolesPage
          ? "مرحباً بكم من الأردن — انتقلوا إلى صفحة أعمدة الكهرباء الخشبية باللغة العربية."
          : "مرحباً بكم من الأردن — هل ترغبون في تصفح النسخة العربية؟"
        : onPolesPage
        ? "تتصفحون من المنطقة العربية — انتقلوا إلى صفحة أعمدة الكهرباء الخشبية بالعربية."
        : "يبدو أنكم تتصفحون من المنطقة العربية — هل تفضلون النسخة العربية؟";
    return {
      targetCode: "ar",
      href,
      lang: "ar",
      dir: "rtl",
      message,
      ctaLabel: "النسخة العربية",
      dismissLabel: "البقاء هنا",
    };
  }

  // 3. Amerika Birleşik Devletleri (US Division — BDIMEXPORT LLC)
  if (country === "US") {
    if (onUsHub) return null;
    // Özel bir İngilizce alt ürün sayfasındaysa (örn. /en/wooden-utility-poles) rahatsız etme; yalnız farklı dildeyse veya genel /en kökündeyse öner
    if (currentLocale === "en" && !onGenericEnEntry) return null;
    const href = pathname === "/en/ar/wooden-utility-poles" ? "/en/wooden-utility-poles" : "/en/us";
    return {
      targetCode: "en-us",
      href,
      lang: "en",
      dir: "ltr",
      message:
        href === "/en/wooden-utility-poles"
          ? "Visiting from the US? Switch to the English Wooden Utility Poles page."
          : "Visiting from the United States? Switch to our dedicated US Division (BDIMEXPORT LLC).",
      ctaLabel: href === "/en/wooden-utility-poles" ? "Switch to English" : "US Division",
      dismissLabel: "Stay",
    };
  }

  // 4. DACH (Almanya, Avusturya, İsviçre, Lihtenştayn)
  if (DACH_COUNTRIES.has(country)) {
    if (currentLocale === "de") return null;
    if (currentLocale === "en" && onPolesPage) return null;
    const href = onInspectionPage ? "/de/leistungen/werkspruefung" : onSourcingPage ? "/de/leistungen/beschaffung" : "/de";
    return {
      targetCode: "de",
      href,
      lang: "de",
      dir: "ltr",
      message: "Besuchen Sie uns aus dem DACH-Raum? Wechseln Sie zur deutschsprachigen Seite.",
      ctaLabel: "Auf Deutsch",
      dismissLabel: "Bleiben",
    };
  }

  // 5. Çin (CN)
  if (country === "CN") {
    if (currentLocale === "zh") return null;
    return {
      targetCode: "zh",
      href: "/zh",
      lang: "zh-CN",
      dir: "ltr",
      message: "检测到您来自中国地区，是否切换至 Bdimexport 简体中文官方网站？",
      ctaLabel: "切换至中文",
      dismissLabel: "留在当前页",
    };
  }

  // 6. Afrika Pazarları (Senegal, Mozambik ve Sahra Altı Afrika)
  if (AFRICA_PRIORITY.has(country)) {
    if (pathname === "/en/ar/wooden-utility-poles") {
      return {
        targetCode: "en-africa-poles",
        href: "/en/wooden-utility-poles",
        lang: "en",
        dir: "ltr",
        message: "Visiting from Africa? Switch to our English Africa Wooden Utility Poles export page.",
        ctaLabel: "Switch to English",
        dismissLabel: "Stay",
      };
    }
    if (currentLocale === "en") return null;
    const browserFr = typeof navigator !== "undefined" && (navigator.language || "").toLowerCase().startsWith("fr");
    if (browserFr && !onPolesPage && currentLocale !== "fr") {
      return {
        targetCode: "fr",
        href: onInspectionPage ? "/en/fr/services/inspection" : onSourcingPage ? "/en/fr/services/sourcing" : "/en/fr",
        lang: "fr",
        dir: "ltr",
        message: "Vous nous visitez depuis l'Afrique francophone — accéder au portail en français ?",
        ctaLabel: "Version française",
        dismissLabel: "Rester",
      };
    }
    if (currentLocale === "fr") return null;
    return {
      targetCode: "en",
      href: onPolesPage ? "/en/wooden-utility-poles" : "/en",
      lang: "en",
      dir: "ltr",
      message: "Visiting from Africa? Switch to our Global English export portal.",
      ctaLabel: "English Portal",
      dismissLabel: "Stay",
    };
  }

  // 7. 9 Yerelleştirilmiş Bölgesel Portal (RU, FR, NL, ES, IT, PL, RO, FI, SQ)
  // Özel bir İngilizce ürün sayfasında okuyan kullanıcıyı genel varyant ana sayfasına çekmemek için yalnız diğer dillerde veya /en kökünde önerilir.
  const canSuggestVariant = currentLocale !== "en" || onGenericEnEntry || onInspectionPage || onSourcingPage;
  if (canSuggestVariant) {
    const variantHref = (v: string) =>
      onInspectionPage ? `/en/${v}/services/inspection` : onSourcingPage ? `/en/${v}/services/sourcing` : `/en/${v}`;

    if (RU_COUNTRIES.has(country) && currentLocale !== "ru") {
      return {
        targetCode: "ru",
        href: variantHref("ru"),
        lang: "ru",
        dir: "ltr",
        message: "Вы зашли из русскоязычного региона — перейти на русскую версию сайта?",
        ctaLabel: "На русском",
        dismissLabel: "Остаться",
      };
    }
    if (FR_COUNTRIES.has(country) && currentLocale !== "fr") {
      return {
        targetCode: "fr",
        href: variantHref("fr"),
        lang: "fr",
        dir: "ltr",
        message: "Vous nous visitez depuis une région francophone — accéder à la version française ?",
        ctaLabel: "Version française",
        dismissLabel: "Rester",
      };
    }
    if (country === "NL" && currentLocale !== "nl") {
      return {
        targetCode: "nl",
        href: variantHref("nl"),
        lang: "nl",
        dir: "ltr",
        message: "Bezoekt u ons vanuit Nederland? Ga naar onze Nederlandstalige pagina.",
        ctaLabel: "Naar Nederlands",
        dismissLabel: "Blijven",
      };
    }
    if (ES_COUNTRIES.has(country) && currentLocale !== "es") {
      return {
        targetCode: "es",
        href: variantHref("es"),
        lang: "es",
        dir: "ltr",
        message: "¿Nos visita desde un país hispanohablante? Cambie a nuestra versión en español.",
        ctaLabel: "Ir a Español",
        dismissLabel: "Quedarse",
      };
    }
    if (country === "IT" && currentLocale !== "it") {
      return {
        targetCode: "it",
        href: variantHref("it"),
        lang: "it",
        dir: "ltr",
        message: "Ci visitate dall'Italia? Passate alla versione italiana del sito.",
        ctaLabel: "Versione italiana",
        dismissLabel: "Resta qui",
      };
    }
    if (country === "PL" && currentLocale !== "pl") {
      return {
        targetCode: "pl",
        href: variantHref("pl"),
        lang: "pl",
        dir: "ltr",
        message: "Odwiedzasz nas z Polski? Przejdź do polskiej wersji serwisu.",
        ctaLabel: "Wersja polska",
        dismissLabel: "Zostań",
      };
    }
    if ((country === "RO" || country === "MD") && currentLocale !== "ro") {
      return {
        targetCode: "ro",
        href: variantHref("ro"),
        lang: "ro",
        dir: "ltr",
        message: "Ne vizitați din România? Treceți la versiunea în limba română.",
        ctaLabel: "Versiunea română",
        dismissLabel: "Rămâi",
      };
    }
    if (country === "FI" && currentLocale !== "fi") {
      return {
        targetCode: "fi",
        href: variantHref("fi"),
        lang: "fi",
        dir: "ltr",
        message: "Vierailetko Suomesta? Siirry suomenkieliselle sivustolle.",
        ctaLabel: "Suomeksi",
        dismissLabel: "Jää tähän",
      };
    }
    if ((country === "AL" || country === "XK") && currentLocale !== "sq") {
      return {
        targetCode: "sq",
        href: variantHref("sq"),
        lang: "sq",
        dir: "ltr",
        message: "Po na vizitoni nga Shqipëria apo Kosova? Kaloni në faqen shqip.",
        ctaLabel: "Shqip",
        dismissLabel: "Qëndro",
      };
    }
  }

  // 8. Diğer Tüm Ülkeler (İngiltere, Kanada, Avustralya, Asya, İskandinavya vb.) Türkçe/Almanca/Çince/Arapça sayfaya düştüyse -> Global English
  if (currentLocale !== "en") {
    return {
      targetCode: "en",
      href: onPolesPage ? "/en/wooden-utility-poles" : "/en",
      lang: "en",
      dir: "ltr",
      message: "Visiting from abroad? Switch to our Global English portal.",
      ctaLabel: "Switch to English",
      dismissLabel: "Stay",
    };
  }

  return null;
}

export default function SmartLocaleBanner({ currentLocale }: { currentLocale: SiteLocaleCode }) {
  const pathname = usePathname() || "/";
  const [suggestion, setSuggestion] = useState<BannerSuggestion | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const previewCountry = (params.get("geo_preview") || "").trim().toUpperCase();

    if (!previewCountry) {
      if (isBotOrAutomation()) return;
      try {
        const raw = localStorage.getItem(STORAGE_DISMISS_KEY);
        if (raw) {
          if (raw === "accepted") return;
          const ts = Number(raw);
          if (!Number.isNaN(ts) && Date.now() - ts < DISMISS_TTL_MS) return;
        }
      } catch {
        // localStorage kapalı olabilir
      }
    }

    let cancelled = false;
    (async () => {
      const country = previewCountry || (await detectVisitorCountry());
      if (cancelled || !country) return;
      const next = buildSuggestion(country, currentLocale, pathname);
      if (!next) {
        setSuggestion(null);
        return;
      }
      setSuggestion(next);
      claritySet("visitor_geo_country", country);
      claritySet("geo_banner_shown", next.targetCode);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentLocale, pathname]);

  if (!suggestion) return null;

  function handleAccept() {
    if (!suggestion) return;
    clarityEvent(`geo_banner_accept_${suggestion.targetCode}`);
    try {
      localStorage.setItem(STORAGE_DISMISS_KEY, "accepted");
    } catch {
      // ignore
    }
    setSuggestion(null);
  }

  function handleDismiss() {
    if (!suggestion) return;
    clarityEvent(`geo_banner_dismiss_${suggestion.targetCode}`);
    try {
      localStorage.setItem(STORAGE_DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setSuggestion(null);
  }

  return (
    <aside
      role="region"
      aria-label="Language suggestion"
      lang={suggestion.lang}
      dir={suggestion.dir}
      className={s.banner}
    >
      <div className={s.inner}>
        <div className={s.msgGroup}>
          <span className={s.globeWrap} aria-hidden="true">
            <Globe className={s.icon} />
          </span>
          <p className={s.text}>{suggestion.message}</p>
        </div>
        <div className={s.actions}>
          <Link
            id={`cta-geo-banner-accept-${suggestion.targetCode}`}
            href={suggestion.href}
            hrefLang={suggestion.lang}
            className={s.switchBtn}
            onClick={handleAccept}
          >
            <span>{suggestion.ctaLabel}</span>
            <ArrowRight aria-hidden="true" className={s.arrowIcon} />
          </Link>
          <button
            id={`cta-geo-banner-dismiss-${suggestion.targetCode}`}
            type="button"
            className={s.dismissBtn}
            onClick={handleDismiss}
          >
            <X aria-hidden="true" className={s.arrowIcon} />
            <span>{suggestion.dismissLabel}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
