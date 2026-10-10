// /en/ru/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/ru/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (RU kolonu birebir: Подбор поставщиков vb.)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "../../md";

const BASE = "https://bdimexport.com";
const RTL = false;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "ru", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/ru/services/sourcing` },
};

export default function RuSourcingPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <nav aria-label="breadcrumb" style={{ fontSize: 14, marginBottom: 16 }}>
        <Link href="/en/ru" style={{ color: "#0E7C7B" }}>Главная</Link>
        <span aria-hidden="true"> → </span>
        <span>Подбор поставщиков</span>
      </nav>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>Свяжитесь с нами</h2>
        <p>Основной канал для покупателей из России — Telegram, резервный — WhatsApp. Прямые ссылки на каналы активируются после их подключения; эта страница будет обновлена. Опишите продукт и целевую цену — ответим в течение 24 часов. Цены указываем в USD, по запросу добавляем ориентир в RUB. Телефон принимается в формате +7.</p>
      </section>
    </main>
  );
}
