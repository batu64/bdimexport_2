// Ahşap Elektrik & Telekom Direkleri Topikal Kale Alt Sayfa (Spoke) Şablonu — EN / AR / FR.
// Her alt sayfa: 100% benzersiz teknik tablo, GEO doğrudan cevap kapsülü, anti-aracı CRO şeridi,
// önceden seçili konteyner hesaplayıcı, Hub & Spoke iç bağlantı ağı, VideoObject + Product + FAQPage JSON-LD.
import Link from "next/link";
import { ArrowRight, Factory, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import Hero from "@/lib/ui/Hero";
import { Section, SectionHeader } from "@/lib/ui/Section";
import UtilityPoleFunnel, { PoleConversionBar, PoleHeroVideoShowcase, PoleStickyMobileBar } from "@/lib/ui/UtilityPoleFunnel";
import WhatsAppFloat from "@/lib/ui/WhatsAppFloat";
import Reveal from "@/lib/ui/motion/Reveal";
import { CORPORATE_ENTITIES, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { SeoJsonLd, SITE_URL, buildProductFunnelGraph } from "@/lib/seo/schema";
import { FUNNEL_COPY_AR, FUNNEL_COPY_EN, FUNNEL_COPY_FR, POLE_GALLERY_IMAGES, POLE_OG_IMAGE, POLE_SCHEMA_SPECS, POLE_VIDEO_META } from "@/lib/seo/poles-funnel-copy";
import type { PoleSpoke } from "@/lib/seo/poles-types";
import ps from "@/lib/seo/proposal.module.css";
import up from "@/lib/ui/utilitypole.module.css";

export default function PoleSpokeTemplate({
  spoke,
  siblings,
}: {
  spoke: PoleSpoke;
  siblings: PoleSpoke[];
}) {
  const { locale } = spoke;
  const hubPath = locale === "ar" ? "/en/ar/wooden-utility-poles" : locale === "fr" ? "/en/fr/wooden-utility-poles" : "/en/wooden-utility-poles";
  const pagePath = `${hubPath}/${spoke.slug}`;
  const pageUrl = `${SITE_URL}${pagePath}`;
  const funnelCopy = locale === "ar" ? FUNNEL_COPY_AR : locale === "fr" ? FUNNEL_COPY_FR : FUNNEL_COPY_EN;
  const videoMeta = POLE_VIDEO_META[locale];

  const ui =
    locale === "ar"
      ? {
          homeName: "الرئيسية",
          homeUrl: `${SITE_URL}/en/ar`,
          hubName: "أعمدة الكهرباء الخشبية من المصنع",
          factoryBanner: "من المصنع التركي مباشرة بدون وسطاء · شحن سريع إلى ليبيا والأردن والعراق والجزائر",
          backToHub: "← العودة إلى الدليل الرئيسي لأعمدة الكهرباء الخشبية",
          primaryCta: "احسب الحمولة والتكلفة الآن",
          secondaryCta: "تواصل فوري عبر واتساب المصنع",
          liveBadge: "فيديو حقيقي من ساحة مصنعنا — تحميل أعمدة 9م",
          posterAlt: "تحميل 140 عمود كهرباء خشبي 9م في حاوية 40 قدم من ساحة مصنع bdimexport",
          selectBtn: "اختر في الحاسبة",
          waBtn: "تسعيرة واتساب",
          clusterEyebrow: "موسوعة التوريد المباشر لأعمدة الكهرباء الخشبية (MENA)",
          clusterTitle: "تصفح أدلة الأسعار والمواصفات حسب الدولة والمعيار الهندسي",
          clusterLead: "جميع المسارات التالية مربوطة مباشرة بخط إنتاج مصنعنا في تركيا وحاسبة الحاويات 40 قدم.",
          faqEyebrow: "إجابات هندسية ومشتريات مباشرة",
          heroSpecs: [
            { val: "7m – 12m", label: "أطوال الشبكات الكهربائية والهاتفية", href: "#rfq" },
            { val: "140 / 40' HC", label: "حمولة الحاوية الواحدة لأعمدة 9م", href: "#rfq" },
            { val: "+90 539 414 78 54", label: "خط واتساب التصدير المباشر" },
          ],
        }
      : locale === "fr"
        ? {
            homeName: "Accueil FR",
            homeUrl: `${SITE_URL}/en/fr`,
            hubName: "Poteaux Électriques en Bois Traité (Usine)",
            factoryBanner: "Usine intégrée en Türkiye — Zéro courtier · Livraison CIF Dakar, Abidjan, Douala & Maghreb",
            backToHub: "← Retour au Hub Principal Poteaux Électriques Bois",
            primaryCta: "Calculer mes conteneurs & devis 24 h",
            secondaryCta: "WhatsApp Direct Usine",
            liveBadge: "Vidéo réelle de notre parc usine — Empotage 9 m",
            posterAlt: "Chargement de 140 poteaux électriques en bois brun de 9 m en conteneur 40' HC",
            selectBtn: "Sélectionner",
            waBtn: "Devis WhatsApp",
            clusterEyebrow: "Dossiers Techniques & Corridors Afrique Francophone",
            clusterTitle: "Explorez nos guides prix, normes NF C 67-100 et corridors maritimes",
            clusterLead: "Chaque dossier technique est connecté en direct à notre bureau d'usine et au calculateur 40' HC.",
            faqEyebrow: "Réponses Techniques & Appels d'Offres",
            heroSpecs: [
              { val: "7m – 12m", label: "Longueurs BT, MT & Télécoms", href: "#rfq" },
              { val: "140 / 40' HC", label: "Capacité vérifiée en 9 m brun", href: "#rfq" },
              { val: "+90 539 414 78 54", label: "Ligne WhatsApp Officielle Usine" },
            ],
          }
        : {
            homeName: "Global Home",
            homeUrl: `${SITE_URL}/en`,
            hubName: "Wooden Electric & Utility Poles (Direct Factory)",
            factoryBanner: "100% Direct Integrated Factory in Türkiye — Zero Brokers · Africa & MENA Export",
            backToHub: "← Back to Main Wooden Electric & Utility Poles Hub",
            primaryCta: "Calculate Containers & Budget Now",
            secondaryCta: "Chat with Factory Desk on WhatsApp",
            liveBadge: "Real Factory Yard Footage — 9m Container Stuffing",
            posterAlt: "Manitou telehandler loading 140 × 9m brown wooden electric poles into a 40ft container",
            selectBtn: "Select in Calc",
            waBtn: "WhatsApp Quote",
            clusterEyebrow: "Wooden Electric Pole Engineering & Africa Export Fortress",
            clusterTitle: "Explore Factory Price Guides, International Standards & Country Corridors",
            clusterLead: "Every technical guide connects directly to our Turkish autoclave plant and 24-hour CIF proforma desk.",
            faqEyebrow: "Procurement & Engineering Q&A",
            heroSpecs: [
              { val: "7m – 12m", label: "LV, MV & Telecom Lengths", href: "#rfq" },
              { val: "140 / 40' HC", label: "Verified 9m Brown Container Load", href: "#rfq" },
              { val: "+90 539 414 78 54", label: "Official Factory WhatsApp Desk" },
            ],
          };

  const graph = buildProductFunnelGraph({
    url: pageUrl,
    inLanguage: locale,
    title: spoke.metaTitle,
    description: spoke.metaDescription,
    productName: spoke.h1,
    sku: spoke.sku,
    mpn: spoke.mpn,
    productId: `${pageUrl}#${spoke.sku}`,
    category: "Wooden Electric & Telecom Utility Poles (HS 4403.11 / 4403.21 · EN 14229 / BS 1990 / SANS 754 / NF C 67-100)",
    image: POLE_OG_IMAGE,
    images: POLE_GALLERY_IMAGES,
    video: videoMeta,
    specs: POLE_SCHEMA_SPECS,
    areaServed: spoke.areaServed,
    crumbs: [
      { name: ui.homeName, url: ui.homeUrl },
      { name: ui.hubName, url: `${SITE_URL}${hubPath}` },
      { name: spoke.metaTitle, url: pageUrl },
    ],
    faq: spoke.faq,
  });

  const directWaHero = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(spoke.heroWaText)}`;

  return (
    <main>
      <SeoJsonLd graph={graph} />

      <div className={up.langBar}>
        <div className={`container ${up.langBarInner}`}>
          <span className={up.factoryBadge}>
            <Factory aria-hidden="true" className={up.badgeIcon} />
            <span>{ui.factoryBanner}</span>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-3)" }}>
            <Link href={hubPath} className={up.langSwitchLink} data-clarity-event={`pole_${locale}_spoke_back_hub`}>
              <span>{ui.backToHub}</span>
            </Link>
            {locale !== "en" && (
              <Link
                href={spoke.crossAlternates?.en ?? "/en/wooden-utility-poles"}
                lang="en"
                hrefLang="en"
                className={up.langSwitchLink}
                data-clarity-event={`pole_${locale}_spoke_switch_en`}
              >
                <Globe aria-hidden="true" className={up.badgeIcon} />
                <span>English</span>
              </Link>
            )}
            {locale !== "ar" && (
              <Link
                href={spoke.crossAlternates?.ar ?? "/en/ar/wooden-utility-poles"}
                lang="ar"
                hrefLang="ar"
                className={up.langSwitchLink}
                data-clarity-event={`pole_${locale}_spoke_switch_ar`}
              >
                <Globe aria-hidden="true" className={up.badgeIcon} />
                <span>العربية</span>
              </Link>
            )}
            {locale !== "fr" && (
              <Link
                href={spoke.crossAlternates?.fr ?? "/en/fr/wooden-utility-poles"}
                lang="fr"
                hrefLang="fr"
                className={up.langSwitchLink}
                data-clarity-event={`pole_${locale}_spoke_switch_fr`}
              >
                <Globe aria-hidden="true" className={up.badgeIcon} />
                <span>Français</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Hero
        id={`pole-spoke-${locale}-${spoke.slug}`}
        eyebrow={spoke.eyebrow}
        title={spoke.h1}
        subtitle={spoke.subtitle}
        primary={{
          id: `cta-pole-spoke-${locale}-calc`,
          label: ui.primaryCta,
          href: "#rfq",
          clarityEvent: `pole_${locale}_spoke_hero_calc`,
        }}
        secondary={{
          id: `cta-pole-spoke-${locale}-wa`,
          label: ui.secondaryCta,
          href: directWaHero,
          clarityEvent: `pole_${locale}_spoke_hero_wa`,
          clarityUpgrade: `pole_${locale}_spoke_wa_lead`,
        }}
        trust={spoke.heroTrust}
        visual={
          <PoleHeroVideoShowcase
            liveBadge={ui.liveBadge}
            posterAlt={ui.posterAlt}
            rfqAnchor="#rfq"
            specs={ui.heroSpecs}
          />
        }
      />

      <Section id="direct-answer-matrix">
        <div className={up.geoCapsule}>
          <span className={up.geoCapsuleLabel}>{spoke.geoCapsuleLabel}</span>
          <p className={up.geoCapsuleBody}>{spoke.geoCapsuleAnswer}</p>
        </div>

        <PoleConversionBar locale={locale} sourcePage={pagePath} rfqAnchor="#rfq" contextLabel={spoke.metaTitle} />
      </Section>

      <Section id="spec-matrix" tone="alt">
        <Reveal>
          <SectionHeader
            id="spec-matrix"
            eyebrow={spoke.tableEyebrow}
            title={spoke.tableTitle}
            lead={spoke.tableLead}
          />
        </Reveal>

        <div className={ps.tableWrap}>
          <table className={ps.table}>
            <thead>
              <tr>
                {spoke.tableHeaders.map((h) => (
                  <th key={h}>{h}</th>
                ))}
                <th>{ui.waBtn}</th>
              </tr>
            </thead>
            <tbody>
              {spoke.tableRows.map((row, idx) => (
                <tr key={idx}>
                  {row.cells.map((cell, cIdx) => (
                    <td key={cIdx} className={cIdx === 0 ? ps.metricCell : undefined}>
                      {row.highlight && cIdx === 0 ? <strong>{cell}</strong> : cell}
                    </td>
                  ))}
                  <td>
                    <div className={up.tableCtaCell}>
                      <a
                        href="#rfq"
                        data-pole-spec={row.specId}
                        data-pole-dest={row.destId}
                        data-pole-notes={row.notes}
                        className={up.tableCalcLink}
                      >
                        <span>{ui.selectBtn}</span>
                      </a>
                      <a
                        href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(row.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={up.tableWaLink}
                        data-clarity-event={`pole_${locale}_spoke_table_wa_${idx + 1}`}
                      >
                        <MessageCircle aria-hidden="true" className={up.badgeIcon} />
                        <span>{ui.waBtn}</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="engineering-brief">
        <div className={up.corridorGrid}>
          {spoke.sections.map((sec) => (
            <article key={sec.title} className={up.corridorCard}>
              <div className={up.corridorTop}>
                <span className={up.corridorBadge}>{sec.badge}</span>
                <h2 className={up.corridorTitle}>{sec.title}</h2>
                {sec.paragraphs.map((p, i) => (
                  <p key={i} className={up.corridorDesc}>
                    {p}
                  </p>
                ))}
              </div>
              <a
                href="#rfq"
                data-pole-spec={sec.specId}
                data-pole-dest={sec.destId}
                data-pole-notes={sec.notes}
                className={up.corridorWaLink}
              >
                <span>{sec.ctaLabel}</span>
                <ArrowRight aria-hidden="true" className={up.dirArrow} />
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section id="rfq-section" tone="alt">
        <UtilityPoleFunnel
          copy={funnelCopy}
          locale={locale}
          sourcePage={pagePath}
          sectionId="rfq"
          defaultSpecId={spoke.defaultSpecId}
          defaultDestId={spoke.defaultDestId}
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            <bdi dir="ltr">{CORPORATE_ENTITIES[0].name}</bdi> (Türkiye) · <bdi dir="ltr">{CORPORATE_ENTITIES[1].name} (D-U-N-S® #{US_DUNS_NUMBER})</bdi> ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event={`pole_${locale}_spoke_sap_ariba`}>
              <bdi dir="ltr">SAP Ariba® {SAP_ARIBA_ID}</bdi>
            </a>{" "}
            · WhatsApp: <bdi dir="ltr">{OFFICIAL_PHONE}</bdi>
          </span>
        </p>
      </Section>

      <Section id="faq">
        <Reveal>
          <SectionHeader id="faq" eyebrow={ui.faqEyebrow} title={spoke.faqTitle} />
        </Reveal>
        <div className={ps.faqStack}>
          {spoke.faq.map((f) => (
            <article key={f.q} className={ps.faqItem}>
              <h3 className={ps.faqQ}>{f.q}</h3>
              <p className={ps.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="related-poles" tone="alt">
        <Reveal>
          <SectionHeader id="related-poles" eyebrow={ui.clusterEyebrow} title={ui.clusterTitle} lead={ui.clusterLead} />
        </Reveal>
        <div className={up.spokeGrid}>
          <Link href={hubPath} className={up.spokeCard} data-clarity-event={`pole_${locale}_cluster_pillar`}>
            <div>
              <span className={up.spokeTag}>PILLAR HUB · 7m–12m</span>
              <h3 className={up.spokeTitle}>{ui.hubName}</h3>
              <p className={up.spokeSummary}>{ui.factoryBanner}</p>
            </div>
            <span className={up.protocolCta}>{ui.backToHub}</span>
          </Link>
          {siblings
            .filter((sb) => sb.slug !== spoke.slug)
            .map((sb) => (
              <Link
                key={sb.slug}
                href={`${hubPath}/${sb.slug}`}
                className={up.spokeCard}
                data-clarity-event={`pole_${locale}_cluster_${sb.slug}`}
              >
                <div>
                  <span className={up.spokeTag}>{sb.hubTag}</span>
                  <h3 className={up.spokeTitle}>{sb.metaTitle}</h3>
                  <p className={up.spokeSummary}>{sb.hubSummary}</p>
                </div>
                <span className={up.protocolCta}>
                  <span>{locale === "ar" ? "افتح الدليل الفني ←" : locale === "fr" ? "Consulter le dossier →" : "Open Engineering Guide →"}</span>
                </span>
              </Link>
            ))}
        </div>
      </Section>

      <PoleStickyMobileBar locale={locale} rfqAnchor="#rfq" waMessage={spoke.heroWaText} />
      {locale === "ar" ? (
        <WhatsAppFloat locale="ar" label="واتساب المصنع المباشر" ariaLabel="تواصل عبر واتساب المصنع المباشر" message={spoke.heroWaText} />
      ) : locale === "fr" ? (
        <WhatsAppFloat locale="en" label="WhatsApp Direct Usine" ariaLabel="WhatsApp Direct Usine" message={spoke.heroWaText} />
      ) : null}
    </main>
  );
}
