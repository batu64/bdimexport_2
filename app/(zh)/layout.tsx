// ZH izole site kökü — D6: kırmızı-altın palet (data-locale=zh, design-tokens §2.1) + Navbar/Footer; içerik FAZ 5
// 简体字 only; ICP vaadi yok (Cloudflare HK — agents/zh-agent.md §6.3)
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";
import Navbar from "@/lib/ui/Navbar";
import Footer from "@/lib/ui/Footer";
import dict from "@/lib/messages/zh.json";
import { footerProps, navbarProps } from "./zh/_lib/chrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://bdimexport.com"),
  title: "土耳其贸易服务 — 采购、验厂、物流 | Bdimexport", // eskiden kök şablonuyla gelen marka açık yazıldı
  description: "为在土耳其开展业务的中国企业提供本地化销售、营销与公司设立服务。",
  // FAZ_4 4.8 — Baidu HTML标签验证 yeri (docs/baidu.md §2). Kod repoya YAZILMAZ: Pages build env NEXT_PUBLIC_BAIDU_SITE_VERIFICATION.
  // Tanımlı değilse meta basılmaz.
  ...(process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
    ? { verification: { other: { "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION } } }
    : {}),
};

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("zh", "zh-CN")}>
      <head>
        <ThemeStyle />
      </head>
      <body>
        <a href="#zhengwen" className="skip-link">{dict.nav.skip}</a>
        <IntlProvider locale="zh">
          <Navbar {...navbarProps()} />
          <div lang="zh-CN" id="zhengwen" tabIndex={-1}>{children}</div>
          <Footer {...footerProps()} />
        </IntlProvider>
      </body>
    </html>
  );
}
