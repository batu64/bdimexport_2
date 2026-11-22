// EN varyant sayfa gövdesi: ana sayfa → Hero; hizmet (sourcing | inspection) → PageHeader (breadcrumb).
// Ardından prose (içindekiler) + #contact iletişim kartı. Tüm varyant page.tsx'leri bunu kullanır.
import { MessageCircle } from "lucide-react";
import Hero from "./Hero";
import PageHeader from "./PageHeader";
import ArticleLayout from "./ArticleLayout";
import { tocFromHtml } from "./md";
import styles from "./variant.module.css";
import { VARIANTS } from "./variants";
import type { EnVariant } from "../i18n";

export default function VariantPageBody({
  variant,
  title,
  html,
  kind,
  desc,
}: {
  variant: EnVariant;
  title: string;
  html: string;
  kind: "home" | "sourcing" | "inspection";
  desc?: string;
}) {
  const v = VARIANTS[variant];
  const base = `/en/${variant}`;
  const serviceLabel = kind === "inspection" ? v.inspection.label : v.sourcing.label;
  return (
    <main>
      {kind === "home" ? (
        <Hero
          eyebrow={v.tagline}
          title={title}
          subtitle={desc ?? v.ctaNote}
          primary={{ label: v.contact.title, href: "#contact" }}
          secondary={{ label: v.inspection.label, href: `${base}/services/inspection` }}
        />
      ) : (
        <PageHeader
          crumbs={[{ label: v.home, href: base }, { label: serviceLabel }]}
          crumbsLabel={v.crumbs}
          eyebrow={v.tagline}
          title={title}
          lead={desc}
        />
      )}
      <ArticleLayout
        toc={tocFromHtml(html)}
        tocLabel={v.toc}
        aside={
          <section id="contact" aria-labelledby="contact-title" className={`on-brand ${styles.contact}`}>
            <span className={styles.contactIcon} aria-hidden="true"><MessageCircle /></span>
            <h2 id="contact-title" className={styles.contactTitle}>{v.contact.title}</h2>
            <p>{v.contact.body}</p>
            <ul role="list" className={styles.channelList}>
              {v.channels.map((c, i) => (
                <li key={c.id} data-primary={i === 0 || undefined}>{c.text}</li>
              ))}
            </ul>
          </section>
        }
      >
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </ArticleLayout>
    </main>
  );
}
