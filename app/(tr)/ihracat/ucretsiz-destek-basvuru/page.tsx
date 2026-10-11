// Başvuru formu sayfası — FAZ_1 Step 1.6 (Opus 5.5 güvenlik review, 2026-10-12)
// KVKK sürümü: v1, sha256(content/tr/legal/kvkk-riza-v1.md)[:16] — workers/api KVKK_VERSIONS ile birebir olmalı.
// Şema (SEO_PLAYBOOK §4, TR huni): Organization + FAQPage + WebPage (+ BreadcrumbList). SSS metni = FAQPage metni.
// SSS içeriği content/tr/ihracat/program-tanitim.md'deki onaylı yanıtlardan alınmıştır (yeni iddia yok).
import type { Metadata } from "next";
import ApplicationForm from "@/app/components/ApplicationForm";
import { JsonLd, pageMainStyle, trAlternates } from "../../_lib/content";

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

export default function UcretsizDestekBasvuruPage() {
  return (
    <main style={pageMainStyle()}>
      <JsonLd graph={graph} />
      <h1>{TITLE}</h1>
      <p>
        Formu yaklaşık 5 dakikada doldurabilirsiniz. Ön değerlendirme sonucu 48 saat içinde e-postanıza gelir.
        KVKK açık rızası zorunludur; logo yayın rızası ayrıdır ve isteğe bağlıdır.
      </p>
      <ApplicationForm kvkkVersion={KVKK_VERSION} />

      <section aria-labelledby="sss">
        <h2 id="sss">Sık Sorulan Sorular</h2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
