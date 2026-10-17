// FAZ_3 3.6 — /admin/content eski yol. Menü /admin/content-factory'yi gösterir; iki ayrı fabrika ekranı olmasın diye burası yalnız yönlendirir.
import type { Metadata } from "next";
import Link from "next/link";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "AI İçerik Fabrikası", robots: { index: false, follow: false } };

export default function AdminContentPage() {
  return (
    <section className={styles.card}>
      <p>İçerik Fabrikası taşındı: <Link href="/admin/content-factory">/admin/content-factory</Link></p>
    </section>
  );
}
