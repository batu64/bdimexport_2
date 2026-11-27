// /ithalat/cin-gumruk-vergisi-hesaplama — Çin Gümrük Vergisi, İGV, Gözetim Uygulaması ve Kapıya Teslim Maliyet Hesaplayıcı
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/lib/ui/PageHeader";
import { Section, SectionHeader } from "@/lib/ui/Section";
import CtaBand from "@/lib/ui/CtaBand";
import ChinaDutyCalculator from "./ChinaDutyCalculator";
import dict from "@/lib/messages/tr.json";
import { JsonLd, trAlternates } from "../../_lib/content";
import ps from "@/lib/seo/proposal.module.css";

const SITE = "https://bdimexport.com";
const URL = `${SITE}/ithalat/cin-gumruk-vergisi-hesaplama`;
const TITLE = "Çin Gümrük Vergisi Hesaplama: İGV ve Gözetim (2026)";
const DESC =
  "Çin'den ithalatta gümrük vergisi hesaplama aracı: CIF matrahı, İlave Gümrük Vergisi (İGV), gözetim uygulaması, anti-damping ve indirilemeyecek KDV simülasyonu.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: trAlternates("/ithalat/cin-gumruk-vergisi-hesaplama"),
};

const FAQ = [
  {
    q: "Çin gümrük vergisi nasıl hesaplanır?",
    a: "Çin'den Türkiye'ye yapılan ticari ithalatta önce ürünün FOB bedeli, uluslararası navlun ve sigorta toplanarak CIF gümrük kıymeti bulunur. Ürünün 12 haneli GTİP kodunda gözetim uygulaması varsa ve gözetim kıymeti CIF'ten yüksekse vergi matrahı gözetim tutarına yükselir. Bu matrah üzerinden Gümrük Vergisi (GV) ve İlave Gümrük Vergisi (İGV), gerçek CIF üzerinden varsa Anti-Damping Vergisi hesaplanır; tüm vergiler ve yurt içi liman giderleri toplanarak KDV matrahına ulaşılır.",
  },
  {
    q: "Gözetim uygulamasında indirilemeyecek KDV nedir?",
    a: "24 Kasım 2023 tarihli Cumhurbaşkanı Kararı ve KDV Genel Uygulama Tebliği değişikliği uyarınca, ithalatta gözetim kıymet farkı nedeniyle fazladan ödenen gümrük vergileri ve bu farka isabet eden ithalat KDV'si indirim konusu yapılamaz; doğrudan maliyet veya gider niteliği taşır. Bu nedenle gözetimli ürünlerde gerçek birim maliyet hesabı sipariş öncesinde yapılmalıdır.",
  },
  {
    q: "İlave Gümrük Vergisi (İGV) her Çin ürününde var mı?",
    a: "Hayır. İlave Gümrük Vergisi (İGV), yerli üretimin korunduğu belirli GTİP fasıllarında (örneğin tekstil, ayakkabı, mobilya, bazı metal eşyalar, aydınlatma ve tüketim ürünlerinde) %5 ile %40+ arasında uygulanırken; Türkiye'de üretimi sınırlı olan bazı endüstriyel ara malı ve makine aksamlarında %0 olabilir.",
  },
  {
    q: "Vadeli ithalatta KKDF (%6) ne zaman doğar?",
    a: "Mal mukabili, kabul kredili veya vadeli akreditifli ödemelerde (ödeme gümrük beyannamesi tescilinden sonra yapılıyorsa) birçok tüketim ve mamul üründe %6 Kaynak Kullanımını Destekleme Fonu (KKDF) doğar. Tutarın beyanname tescilinden önce peşin (transfer/peşin akreditif) ödenmesi ve banka transfer bildirim formunun sunulması halinde KKDF %0 uygulanır.",
  },
  {
    q: "Sipariş vermeden önce net GTİP, TAREKS ve vergi oranlarını doğruluyor musunuz?",
    a: "Evet. Ticari İstihbarat ve Çin İthalat Danışmanlığı kapsamımızda, tedarikçiye kapora göndermeden önce ürünün teknik föyü üzerinden GTİP ön tespitini, TAREKS/CE denetim şartlarını, gözetim ve anti-damping riskini yazılı olarak simüle ediyoruz.",
  },
];

export default function CinGumrukVergisiHesaplamaPage() {
  const graph = [
    {
      "@type": "WebApplication",
      name: "Çin Gümrük Vergisi, İGV ve Gözetim Maliyet Hesaplayıcı",
      url: URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      inLanguage: "tr-TR",
      description: DESC,
      offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE },
        { "@type": "ListItem", position: 2, name: "Çin'den İthalat", item: `${SITE}/ithalat` },
        { "@type": "ListItem", position: 3, name: "Çin Gümrük Vergisi Hesaplama", item: URL },
      ],
    },
  ];

  return (
    <main>
      <JsonLd graph={graph} />
      <PageHeader
        crumbs={[
          { label: dict.content.home, href: "/" },
          { label: dict.content.ithalat, href: "/ithalat" },
          { label: "Çin Gümrük Vergisi Hesaplama" },
        ]}
        crumbsLabel={dict.page.crumbs}
        eyebrow="Ücretsiz İnteraktif Maliyet Aracı · CIF + GV + İGV + Gözetim + KDV"
        title="Çin Gümrük Vergisi, İGV ve Gözetim Hesaplama Aracı"
        lead="Çin'den ürün getirmeden önce FOB fabrika fiyatının üzerine binecek navlun, Gümrük Vergisi (GV), İlave Gümrük Vergisi (İGV), Gözetim kıymet farkı ve indirilemeyecek KDV etkisini saniyeler içinde simüle edin."
      />

      <Section id="arac">
        <ChinaDutyCalculator />
      </Section>

      <Section id="maliyet-kalemleri" tone="alt">
        <SectionHeader
          id="maliyet-kalemleri"
          eyebrow="Türkiye Gümrük Mevzuatı Pratik Özeti"
          title="Çin'den İthalatta Vergi Matrahını Değiştiren 5 Kritik Kalem"
          lead="Yalnızca fabrika FOB fiyatına bakarak verilen siparişler limanda beklenmedik nakit çıkışlarına yol açar. Aşağıdaki beş kalem her siparişte kontrol edilmelidir."
        />
        <div className={ps.tableWrap}>
          <table className={ps.table}>
            <thead>
              <tr>
                <th>Vergi / Mevzuat Kalemi</th>
                <th>Nasıl Uygulanır?</th>
                <th>Sipariş Öncesi Önlemimiz</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={ps.metricCell}>1. Gümrük Vergisi (GV) &amp; İGV</td>
                <td>Türkiye–Çin arasında STA bulunmadığından 12 haneli GTİP koduna ait Üçüncü Ülke GV oranı ve varsa İlave Gümrük Vergisi (İGV) tahsil edilir.</td>
                <td>Ürün teknik çizimi ve malzeme yapısına göre doğru GTİP aralığının ön analizi (<Link href="/ithalat/gumruk">Gümrük Süreci</Link>).</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>2. Gözetim Uygulaması</td>
                <td>Birim/kg gümrük kıymeti tebliğdeki eşikten düşük kalırsa ya Ekonomi/Ticaret Bakanlığı gözetim belgesi alınır ya da aradaki fark yurt dışı gider beyan edilerek vergi matrahına eklenir.</td>
                <td>İndirilemeyecek KDV yükünü siparişten önce hesaplayıp gerekirse yüksek katma değerli ürün/tedarikçi kurgusu (<Link href="/ticari-istihbarat">Ticari İstihbarat</Link>).</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>3. Anti-Damping (Haksız Rekabet Vergisi)</td>
                <td>Çin menşeli seramik, bağlantı elemanları, bazı çelik/alüminyum profiller, tekstil ve cam kalemlerinde %20–%70+ veya ton başına sabit USD anti-damping vergisi uygulanabilir.</td>
                <td>Üretici bazlı muafiyet/oran kontrolü ve <Link href="/ithalat/ticari-istihbarat-uretici-dogrulama">Çin Şirket Doğrulama</Link>.</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>4. TAREKS, CE ve Ürün Güvenliği</td>
                <td>Oyuncak, makine, elektrikli cihaz, KKD, aydınlatma ve tekstil/ayakkabı ürünlerinde gümrük çekimi öncesi TAREKS referans numarası ve geçerli EN test raporları şarttır.</td>
                <td>Fabrikanın CE/LVD/EMC raporlarını kapora göndermeden doğrulama ve <Link href="/ithalat/fabrika-denetimi">Çin Fabrika Denetimi</Link>.</td>
              </tr>
              <tr>
                <td className={ps.metricCell}>5. Navlun &amp; Yükleme Eksikleri</td>
                <td>Ucuz CIF LCL tekliflerinde Türkiye limanında yüksek ordino/CFS ücreti çıkar; denetimsiz yüklemelerde eksik koli bile tam beyan üzerinden vergilendirilir.</td>
                <td>FOB bazlı şeffaf <Link href="/ithalat/lojistik">Konteyner &amp; Parsiyel Taşıma</Link> ve <Link href="/ithalat/konteyner-yukleme-denetimi">Konteyner Yükleme Nezareti</Link>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginBlockStart: "var(--s-4)" }}>
          <em>Not: Bu hesaplama aracı ticari ön fizibilite amaçlıdır; resmi beyanname tahakkuku Gümrük Müşaviriniz tarafından tescil günündeki TCMB döviz satış kuru ve güncel İthalat Rejimi Kararı eki listelere göre yapılır. Danışmanlık paketlerimiz için <Link href="/ithalat/danismanlik-ucretleri">Çin İthalat Danışmanlık Ücretleri</Link> sayfamızı inceleyebilirsiniz.</em>
        </p>
      </Section>

      <Section id="sss">
        <SectionHeader id="sss" eyebrow="Sık Sorulan Sorular" title="Çin Gümrük Vergisi ve Gözetim Hakkında Merak Edilenler" />
        <div className={ps.faqStack}>
          {FAQ.map((f, idx) => (
            <details key={f.q} className={ps.faqDetails} open={idx === 0}>
              <summary className={ps.faqSummary}>{f.q}</summary>
              <p className={ps.faqBody}>{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Ürününüzün Gerçek Depo Teslim Maliyetini ve Üreticisini Doğrulayalım"
        lead="GTİP, gözetim, TAREKS ve Çin fabrika fiyatlarını tek raporda görmek için ürün bilginizi iletin; 24 saat içinde yazılı kapsam ve teklif paylaşalım."
        primary={{ label: "Ücretsiz Ön Değerlendirme / RFQ Al (24s)", href: "/rfq" }}
        secondary={{ label: "Danışmanlık ve Denetim Ücretleri", href: "/ithalat/danismanlik-ucretleri" }}
      />
    </main>
  );
}
