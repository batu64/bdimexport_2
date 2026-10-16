// TR ana sayfa — Proje.md segment TR
import type { Metadata } from "next";
import Link from "next/link";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: { absolute: "İthalat & İhracat Danışmanlığı | Bdimexport" }, // kök layout aynı segmentte: şablon uygulanmaz
  description:
    "Çin'den ithalatta tedarik, denetim, lojistik ve gümrük; ihracatta e-ihracat ve B2B danışmanlık. Ücretsiz teklif alın.",
  alternates: toMetadataAlternates(buildAlternateSet("", ["tr"])),
};

export default function TrHomePage() {
  return (
    <main>
      <section>
        <h1>Çin'den İthalattan Global İhracata — Tek Danışmanlık Noktası</h1>
        <p>
          Tedarik, fabrika denetimi, lojistik ve gümrük süreçlerinizi uçtan uca yönetiyoruz.
          İhracata başlamak isteyen üreticiler için ücretsiz hızlandırma programı.
        </p>
        <Link href="/ihracat/ucretsiz-destek-basvuru">Ücretsiz İhracat Hızlandırma Başvurusu</Link>
        <Link href="/ithalat">İthalat Danışmanlığı</Link>
      </section>
      <nav aria-label="Diller">
        <Link href="/zh" lang="zh-CN">简体中文</Link> · <Link href="/en">English</Link> ·{" "}
        <Link href="/de">Deutsch</Link>
      </nav>
    </main>
  );
}
