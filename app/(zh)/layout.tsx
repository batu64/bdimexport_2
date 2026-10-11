// ZH izole site placeholder — FAZ 5 (Qwen 3.8 içerik) + kırmızı-altın palet (design-tokens zh varyantı)
// 简体字 only; ICP vaadi yok (Cloudflare HK — agents/zh-agent.md §6.3)
import type { Metadata } from "next";
import { IntlProvider } from "@/lib/intl";

export const metadata: Metadata = {
  title: "土耳其贸易服务 — 采购、验厂、物流",
  description: "为在土耳其开展业务的中国企业提供本地化销售、营销与公司设立服务。",
};

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <IntlProvider locale="zh">
      <div lang="zh-CN" dir="ltr">
        {children}
      </div>
    </IntlProvider>
  );
}
