// /en/ar/services/sourcing — FAZ_2 Step 2.5 örnek hizmet sayfası (en-l10n-agent)
// İskelet-only kanıt sayfası; içerik: content/en/ar/services/sourcing.md
// Terminoloji: I18N_RULES §3.1 sözlüğü (AR kolonu sözlükte yok — manifest glossary_proposal'a bak)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { renderVariantMd } from "../../md";

const BASE = "https://bdimexport.com";
const RTL = true;

const parsed = renderVariantMd(
  fs.readFileSync(
    path.join(process.cwd(), "content", "en", "ar", "services", "sourcing.md"),
    "utf-8",
  ),
  { rtl: RTL },
);

export const metadata: Metadata = {
  title: parsed.metaTitle ?? parsed.title,
  description: parsed.desc,
  alternates: { canonical: `${BASE}/en/ar/services/sourcing` },
};

export default function ArSourcingPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <nav aria-label="breadcrumb" style={{ fontSize: 14, marginBottom: 16 }}>
        <Link href="/en/ar" style={{ color: "#0E7C7B" }}>الرئيسية</Link>
        <span aria-hidden="true"> → </span>
        <span>التوريد</span>
      </nav>
      <h1 style={{ color: "#1A2B4A", lineHeight: 1.2 }}>{parsed.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: parsed.html }} />
      <section
        id="contact"
        style={{ marginTop: 48, borderInlineStart: "4px solid #E8A13D", paddingInlineStart: 16 }}
      >
        <h2 style={{ color: "#1A2B4A" }}>تواصلوا معنا</h2>
        <p>قناتنا الرئيسية هي واتساب للأعمال (WhatsApp Business). سيتم تفعيل الروابط المباشرة فور تشغيل القناة، وستُحدَّث هذه الصفحة. أرسلوا طلبكم مع وصف المنتج والسعر المستهدف، وسنرد خلال 24 ساعة. الأسعار بالدولار الأمريكي مع إمكانية الإشارة إلى الدرهم الإماراتي (AED) أو الريال السعودي (SAR) حسب سوقكم.</p>
      </section>
    </main>
  );
}
