// EN varyant sayfa gövdesi (D5): ana sayfa → Hero; hizmet → PageHeader (breadcrumb). Ardından prose (içindekiler) + #contact
// iletişim kartı (kanal CTA hedefi) + kapanış bandı. Tüm 10 page.tsx bunu kullanır → stil/RTL tek yerde. Metin: md + sözlük.
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
  kind: "home" | "sourcing";
  desc?: string;
}) {
  const v = VARIANTS[variant];
  const base = `/en/${variant}`;
  return (
    <main>
      {kind === "home" ? (
        <Hero
          eyebrow={v.tagline}
          title={title}
          subtitle={desc ?? v.ctaNote}
          primary={{ label: v.contact.title, href: "#contact" }}
          secondary={{ label: v.sourcing.label, href: `${base}/services/sourcing` }}
        />
      ) : (
        <PageHeader
          crumbs={[{ label: v.home, href: base }, { label: v.sourcing.label }]}
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
