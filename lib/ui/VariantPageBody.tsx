// EN varyant sayfa gövdesi: h1 + md html + #contact bloğu (+ breadcrumb / sayfa nav).
// Tüm 10 page.tsx bunu kullanır → stil/RTL tek yerde.
import Link from "next/link";
import styles from "./variant.module.css";
import { VARIANTS } from "./variants";
import type { EnVariant } from "../i18n";

export default function VariantPageBody({
  variant,
  title,
  html,
  kind,
}: {
  variant: EnVariant;
  title: string;
  html: string;
  kind: "home" | "sourcing";
}) {
  const v = VARIANTS[variant];
  return (
    <main className={styles.main}>
      {kind === "sourcing" && (
        <nav aria-label="breadcrumb" className={styles.crumb}>
          <Link href={`/en/${variant}`}>{v.home}</Link>
          <span aria-hidden="true"> {v.dir === "rtl" ? "←" : "→"} </span>
          <span>{v.sourcing.label}</span>
        </nav>
      )}
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <section id="contact" className={styles.contact}>
        <h2>{v.contact.title}</h2>
        <p>{v.contact.body}</p>
      </section>
      {kind === "home" && (
        <nav aria-label={v.navLabel} className={styles.pageNav}>
          <Link href={`/en/${variant}/services/sourcing`}>{v.sourcing.label}</Link>
          {" · "}
          <Link href="/en" lang="en">English</Link>
        </nav>
      )}
    </main>
  );
}
