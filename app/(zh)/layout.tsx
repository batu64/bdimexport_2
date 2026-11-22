// ZH izole site kökü — D6: kırmızı-altın palet (data-locale=zh, design-tokens §2.1) + Navbar/Footer; içerik FAZ 5
// 简体字 only; ICP vaadi yok (Cloudflare HK — agents/zh-agent.md §6.3)
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import ClarityScript from "@/lib/ui/ClarityScript";
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";
import PageTransition from "@/lib/ui/motion/PageTransition";
import Navbar from "@/lib/ui/Navbar";
import Footer from "@/lib/ui/Footer";
import dict from "@/lib/messages/zh.json";
import { footerProps, navbarProps } from "./zh/_lib/chrome";

// FAZ_5 5.5 — Baidu SEO katmanı. Baidu meta sınırları (SEO_PLAYBOOK §9 / zh-agent §3): title ≤ 30, description ≤ 78 karakter.
// Doğrulama (HTML标签验证) değeri repoya YAZILMAZ: Pages build env NEXT_PUBLIC_BAIDU_SITE_VERIFICATION (docs/baidu.md §2).
// Yalnız Baidu kod biçimine uyan değer basılır (ör. codeva-XXXX) — env'e yanlışlıkla HTML/boşluk girerse meta HİÇ basılmaz.
// Canlı doğrulama = ERTELENEN E9 (bdimexport.com custom domain sonrası, 👤 Baidu hesabı).
const BAIDU_VERIFY = /^[A-Za-z0-9_-]{6,64}$/.test(process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION ?? "")
  ? process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
  : undefined;

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: dict.seo.title,
  description: dict.seo.description,
  // zh robots: açıkça indekslenebilir (Baiduspider robots.txt'de ayrıca Allow + sitemap-zh — 4.8 orchestrator dosyası)
  robots: { index: true, follow: true },
  other: {
    // Baidu mobil uyum beyanı: tek URL, duyarlı tasarım (pc + mobil aynı sayfa)
    "applicable-device": "pc,mobile",
    ...(BAIDU_VERIFY ? { "baidu-site-verification": BAIDU_VERIFY } : {}),
  },
};

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("zh", "zh-CN")}>
      <head>
        <ThemeStyle />
        <ClarityScript />
        {/* Baidu 转码 engeli: mobil arama sonuçlarında sayfanın Baidu tarafından yeniden kodlanmasını/siteapp'e alınmasını önler */}
        <meta httpEquiv="Cache-Control" content="no-transform" />
        <meta httpEquiv="Cache-Control" content="no-siteapp" />
      </head>
      <body>
        <a href="#zhengwen" className="skip-link">{dict.nav.skip}</a>
        <IntlProvider locale="zh">
          <Navbar {...navbarProps()} />
          <div lang="zh-CN" id="zhengwen" tabIndex={-1}><PageTransition>{children}</PageTransition></div>
          <Footer {...footerProps()} />
        </IntlProvider>
      </body>
    </html>
  );
}
