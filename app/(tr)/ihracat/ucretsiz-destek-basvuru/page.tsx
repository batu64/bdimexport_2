// Başvuru formu sayfası — FAZ_1 Step 1.6 (Opus 5.5 güvenlik review, 2026-10-12)
// KVKK sürümü: v1, sha256(content/tr/legal/kvkk-riza-v1.md)[:16] — workers/api KVKK_VERSIONS ile birebir olmalı.
// Şema (SEO_PLAYBOOK §4, TR huni): Organization + FAQPage + WebPage (+ BreadcrumbList). SSS metni = FAQPage metni.
// SSS içeriği content/tr/ihracat/program-tanitim.md'deki onaylı yanıtlardan alınmıştır (yeni iddia yok).
import type { Metadata } from "next";
import { BadgeCheck, Clock, Gift, ShieldCheck } from "lucide-react";
import ApplicationForm from "@/app/components/ApplicationForm";
import PageHeader from "@/lib/ui/PageHeader";
import dict from "@/lib/messages/tr.json";
import { JsonLd, trAlternates } from "../../_lib/content";
import st from "./basvuru.module.css";

const KVKK_VERSION = "v1 (47ac2ef0a5b43264)";
const PATH = "/ihracat/ucretsiz-destek-basvuru";
const TITLE = "Ücretsiz İhracat Hızlandırma Başvurusu";
const DESC =
  "Türk üreticiler için Ücretsiz İhracat Hızlandırma Programı başvuru formu. Formu doldurun, ön değerlendirme sonucunu 48 saat içinde e-postayla alın.";

const alternates = trAlternates(PATH);
const PAGE_URL = String(alternates?.canonical);
const SITE = new URL(PAGE_URL).origin;

const FAQ: { q: string; a: string }[] = [
  {
    q: "Program gerçekten ücretsiz mi?",
    a: "Değerlendirme, listeleme ve eşleştirme ücretsizdir. Satış gerçekleştiğinde uygulanacak hizmet bedeli veya komisyon çerçevesi baştan yazılı olarak açıklanır.",
  },
  {
    q: "Başvurum ne zaman değerlendirilir?",
    a: "Ön değerlendirme en geç 48 saat içinde yapılır ve sonuç formda verdiğiniz e-posta adresine bildirilir. Ardından kapasite ve sertifikalar için görüşme planlanır.",
  },
  {
    q: "Logomu yayınlamak zorunda mıyım?",
    a: "Hayır. Logo ve firma adının yabancı dil sayfalarında yayınlanması ayrı ve isteğe bağlı bir rızadır. Bu rızayı vermeseniz de başvurunuz değerlendirilir ve eşleştirmeye dahil olursunuz.",
  },
  {
    q: "İhracat geçmişim yok, başvurabilir miyim?",
    a: "Evet. Programın amacı ihracatta ilk adımı hızlandırmaktır. Üretim kapasitesinin gerçekliği ve iletişim erişilebilirliği esas alınır; ihracat geçmişi ve sertifikalar yalnızca artı puandır.",
  },
  {
    q: "Başvurum reddedilirse tekrar başvurabilir miyim?",
    a: "Evet. Ret gerekçesi size bildirilir. Gerekçe giderildiğinde yeniden başvurunuz değerlendirmeye alınır.",
  },
];

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Bdimexport` },
  description: DESC,
  alternates,
};

const graph = [
  { "@type": "Organization", "@id": `${SITE}/#org`, name: "Bdimexport", url: SITE },
  {
    "@type": "WebPage",
    "@id": PAGE_URL,
    url: PAGE_URL,
    name: TITLE,
    description: DESC,
    inLanguage: "tr",
    publisher: { "@id": `${SITE}/#org` },
  },
  {
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "İhracat", item: `${SITE}/ihracat` },
      { "@type": "ListItem", position: 3, name: TITLE, item: PAGE_URL },
    ],
  },
];

const TRUST_ICON = [Clock, Gift, BadgeCheck, ShieldCheck];

export default function UcretsizDestekBasvuruPage() {
  const t = dict.form;
  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={[{ label: dict.content.home, href: "/" }, { label: dict.content.ihracat, href: "/ihracat" }, { label: TITLE }]}
        crumbsLabel={dict.page.crumbs}
        eyebrow={t.eyebrow}
        title={TITLE}
        lead={t.lead}
      />
      <div className={`container ${st.grid}`}>
        <section aria-labelledby="form-title" className={st.formCard}>
          <h2 id="form-title" className={st.formTitle}>{t.formTitle}</h2>
          <ApplicationForm kvkkVersion={KVKK_VERSION} />
        </section>
        <aside aria-labelledby="trust-title" className={st.aside}>
          <div className={st.sticky}>
            <h2 id="trust-title" className={st.asideTitle}>{t.trustTitle}</h2>
            <ul role="list" className={st.trust}>
              {t.trust.map((x, i) => {
                const Icon = TRUST_ICON[i] ?? ShieldCheck;
                return (
                  <li key={x.title}>
                    <span className={st.trustIcon} aria-hidden="true"><Icon /></span>
                    <span>
                      <strong>{x.title}</strong>
                      <span className={st.trustText}>{x.text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>

      <section aria-labelledby="sss" className={`section section-alt ${st.faqSection}`}>
        <div className="container">
          <h2 id="sss" className={st.faqTitle}>{t.faqTitle}</h2>
          <div className="prose">
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
