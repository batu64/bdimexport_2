// ZH izole site placeholder — FAZ 5 (Qwen 3.8 içerik) + kırmızı-altın palet (design-tokens zh varyantı)
// 简体字 only; ICP vaadi yok (Cloudflare HK — agents/zh-agent.md §6.3)
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";

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
    <IntlProvider locale="zh">
      <div lang="zh-CN" dir="ltr">
        {children}
      </div>
    </IntlProvider>
      </body>
    </html>
  );
}
