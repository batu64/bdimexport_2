// TR ana sayfa — OPUS_TASARIM_TALIMATI D3. Metin: lib/messages/tr.json (hero = design/hero-copy.md v2.1).
// Hizmet/rehber kartları İÇERİKTEN (content/tr/**/*.md) — elle liste yok. Rakamlar yalnız SLA taahhüdü veya içerik sayımı.
// Primary (amber) CTA iki konumda: hero + son bölüm (cta.md). Navbar CTA secondary görünümde.
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Factory, FileSearch, Globe2, Handshake, Landmark, Package, PackageSearch, Rocket, Ship } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildAlternateSet, toMetadataAlternates } from "@/lib/hreflang";
import dict from "@/lib/messages/tr.json";
import Hero from "@/lib/ui/Hero";
import ProcessTracker from "@/lib/ui/ProcessTracker";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import Card from "@/lib/ui/Card";
import Button from "@/lib/ui/Button";
import CtaBand from "@/lib/ui/CtaBand";
import Reveal from "@/lib/ui/motion/Reveal";
import { listSlugs, readDoc } from "./_lib/content";
import { quoteHref, services } from "./_lib/chrome";
import { GUIDE_ICON, SERVICE_ICON } from "./_lib/icons";
import { APPLY_PATH as APPLY } from "./_lib/links";
import s from "./home.module.css";

export const metadata: Metadata = {
  title: { absolute: "İthalat & İhracat Danışmanlığı | Bdimexport" }, // kök layout aynı segmentte: şablon uygulanmaz
  description:
    "Çin'den ithalatta tedarik, denetim, lojistik ve gümrük; ihracatta e-ihracat ve B2B danışmanlık. Ücretsiz teklif alın.",
  alternates: toMetadataAlternates(buildAlternateSet("", ["tr"])),
};

const STEP_ICON: LucideIcon[] = [FileSearch, PackageSearch, Factory, Ship, Landmark];

export default function TrHomePage() {
  const h = dict.home;
  const imports = services("ithalat");
  const exports = services("ihracat");
  const guides = listSlugs("rehber").flatMap((slug) => {
    const d = readDoc("rehber", slug);
    return d ? [{ slug, title: d.title, desc: d.desc ?? "" }] : [];
  });
  const counts: Record<string, number> = { importServices: imports.length, guides: guides.length };
  const stats = h.stats.items.map((it) => ({
    value: typeof it.value === "number" ? it.value : (counts[it.key ?? ""] ?? 0),
    unit: it.unit,
    label: it.label,
  }));

  return (
    <main>
      <Hero
        eyebrow={h.hero.eyebrow}
        title={h.hero.h1}
        subtitle={h.hero.sub}
        primary={{ label: h.hero.ctaPrimary, href: APPLY }}
        secondary={{ label: h.hero.ctaSecondary, href: quoteHref }}
        trust={h.hero.trust}
        trustLabel={h.stats.label}
        visual={
          <ProcessTracker
            title={h.hero.visual.title}
            caption={h.hero.visual.caption}
            route={h.hero.visual.route}
            steps={h.hero.visual.steps}
            labels={{ done: h.hero.visual.done, active: h.hero.visual.active, next: h.hero.visual.next }}
            doneCount={2}
            badge={h.hero.visual.badge}
          />
        }
      />

      <StatBand items={stats} label={h.stats.label} locale="tr" />

      {/* ── Hizmetler: iki yön */}
      <Section id="hizmetler">
        <Reveal><SectionHeader id="hizmetler" eyebrow={h.services.eyebrow} title={h.services.title} lead={h.services.lead} /></Reveal>
        <div className={s.split}>
          {[
            { key: "import", t: h.services.import, intro: dict.indexes.ithalat.intro, items: imports, href: "/ithalat", Icon: Globe2 },
            { key: "export", t: h.services.export, intro: dict.indexes.ihracat.intro, items: exports, href: "/ihracat", Icon: Rocket },
          ].map((p, i) => (
            <Reveal key={p.key} index={i} className={s.panelWrap}>
              <article className={s.panel} data-kind={p.key}>
                <div className={s.panelHead}>
                  <span className={s.panelIcon} aria-hidden="true"><p.Icon /></span>
                  <h3 className={s.panelTitle}><Link href={p.href}>{p.t.title}</Link></h3>
                  <p className={s.panelIntro}>{p.intro.replace(/:$/, ".")}</p>
                </div>
                <ul role="list" className={s.serviceList}>
                  {p.items.map((it) => {
                    const Icon = SERVICE_ICON[it.slug] ?? ArrowRight;
                    return (
                      <li key={it.slug}>
                        <Link href={it.href} className={s.serviceRow}>
                          <Icon aria-hidden="true" className={s.rowIcon} />
                          <span className={s.rowText}>
                            <span className={s.rowTitle}>{it.title}</span>
                            <span className={s.rowDesc}>{it.desc}</span>
                          </span>
                          <ArrowRight aria-hidden="true" className={s.rowArrow} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Button href={p.href} variant="ghost">{p.t.more}</Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Süreç: 5 adım */}
      <Section id="surec" tone="alt">
        <Reveal><SectionHeader id="surec" eyebrow={h.process.eyebrow} title={h.process.title} align="center" /></Reveal>
        <ol className={s.steps}>
          {h.process.steps.map((st, i) => {
            const Icon = STEP_ICON[i];
            return (
              <Reveal as="li" key={st.title} index={i} className={s.step}>
                <span className={s.stepNum} aria-hidden="true">
                  <Icon className={s.stepIcon} />
                </span>
                <span className={s.stepIdx} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={s.stepTitle}>{st.title}</h3>
                <p className={s.stepText}>{st.text}</p>
              </Reveal>
            );
          })}
        </ol>
      </Section>

      {/* ── İhracat Hızlandırma Programı (flywheel) */}
      <Section id="program" tone="brand" className={s.program}>
        <div className={s.programGrid}>
          <Reveal className={s.programCopy}>
            <SectionHeader id="program" eyebrow={h.program.eyebrow} title={h.program.title} lead={h.program.lead} />
            <Button href="/ihracat/program-tanitim" variant="secondary" tone="brand" arrow>{h.program.more}</Button>
          </Reveal>
          <div className={s.flywheel}>
            <span className={s.flyLine} aria-hidden="true" />
            <ol className={s.flyList}>
            {h.program.steps.map((st, i) => {
              const Icon = [Handshake, BadgeCheck, Globe2][i];
              return (
                <Reveal as="li" key={st.title} index={i} className={s.flyStep}>
                  <span className={s.flyIcon} aria-hidden="true"><Icon /></span>
                  <div>
                    <h3 className={s.flyTitle}>{st.title}</h3>
                    <p className={s.flyText}>{st.text}</p>
                  </div>
                </Reveal>
              );
            })}
            </ol>
          </div>
        </div>
      </Section>

      {/* ── Rehberler */}
      <Section id="rehberler">
        <Reveal>
          <SectionHeader
            id="rehberler"
            eyebrow={h.guides.eyebrow}
            title={h.guides.title}
            lead={h.guides.lead}
            action={<Button href="/ithalat/rehberler" variant="ghost">{h.guides.more}</Button>}
          />
        </Reveal>
        <ul role="list" className={s.cards}>
          {guides.map((g, i) => {
            const Icon = GUIDE_ICON[g.slug] ?? Package;
            return (
              <Reveal as="li" key={g.slug} index={i % 3}>
                <Card title={g.title} href={`/ithalat/rehberler/${g.slug}`} description={g.desc} icon={<Icon />} more={h.guides.read} />
              </Reveal>
            );
          })}
        </ul>
      </Section>

      {/* ── Onaylı Türk İş Ortakları (boş durum: hero-copy TR) */}
      <Section id="ortaklar" tone="alt">
        <Reveal>
          <div className={s.partners}>
            <span className={s.partnerBadge}>
              <BadgeCheck aria-hidden="true" className={s.partnerIcon} />
              {h.partners.badge}
            </span>
            <h2 id="ortaklar-title" className={s.partnersTitle}>{h.partners.title}</h2>
            <p className={s.partnersEmpty} aria-live="polite">{h.partners.empty}</p>
            <ul role="list" className={s.ghostLogos} aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => <li key={i} style={{ "--i": i } as React.CSSProperties} />)}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* ── Kapanış CTA */}
      <CtaBand
        title={h.cta.title}
        lead={h.cta.lead}
        primary={{ label: h.hero.ctaPrimary, href: APPLY }}
        secondary={{ label: h.hero.ctaSecondary, href: quoteHref }}
      />
    </main>
  );
}
