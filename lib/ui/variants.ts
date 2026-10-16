// EN varyant yapılandırması — I18N_RULES §2 (kanal matrisi) + §4 (RTL). Tek kaynak: 5 varyant layout'u bu veriden çizilir.
// Gerçek kanal handle'ları FAZ_8'de leads.channel_pref'ten bağlanır; o zamana dek #contact çapası (uydurma link YASAK).
import { enVariants, type EnVariant } from "../i18n";

export type Channel = "telegram" | "whatsapp" | "email";

export interface VariantConfig {
  lang: string;
  dir: "ltr" | "rtl";
  /** switcher'da kendi dilinde ad */
  label: string;
  /** [birincil, (ikincil)] — matris I18N_RULES §2 */
  channels: { id: Channel; text: string }[];
  ctaNote: string;
  tagline: string;
  home: string;
  navLabel: string;
  contact: { title: string; body: string };
  sourcing: { label: string };
  switcherLabel: string;
}

export const VARIANTS: Record<EnVariant, VariantConfig> = {
  ru: {
    lang: "ru", dir: "ltr", label: "Русский",
    channels: [{ id: "telegram", text: "Telegram" }, { id: "whatsapp", text: "WhatsApp" }],
    ctaNote: "Основной канал — Telegram · Бесплатное коммерческое предложение за 24 часа",
    tagline: "B2B-закупки и экспорт из Турции",
    home: "Главная", navLabel: "Навигация", switcherLabel: "Язык",
    contact: {
      title: "Свяжитесь с нами",
      body: "Основной канал для покупателей из России — Telegram, резервный — WhatsApp. Прямые ссылки на каналы активируются после их подключения; эта страница будет обновлена. Опишите продукт и целевую цену — ответим в течение 24 часов. Цены указываем в USD, по запросу добавляем ориентир в RUB. Телефон принимается в формате +7.",
    },
    sourcing: { label: "Подбор поставщиков" },
  },
  fr: {
    lang: "fr", dir: "ltr", label: "Français",
    channels: [{ id: "email", text: "Nous écrire" }, { id: "whatsapp", text: "WhatsApp" }],
    ctaNote: "Devis gratuit sous 24 heures · Prix en EUR",
    tagline: "Approvisionnement et export B2B depuis la Turquie",
    home: "Accueil", navLabel: "Navigation", switcherLabel: "Langue",
    contact: {
      title: "Contactez-nous",
      body: "Vos canaux : e-mail (principal) et WhatsApp. Les liens directs seront activés dès la mise en service de nos canaux ; cette page sera mise à jour. Envoyez votre demande avec votre produit et votre prix cible : nous vous répondons sous 24 heures. Prix en EUR ; numéros de téléphone acceptés au format +33.",
    },
    sourcing: { label: "Approvisionnement (sourcing)" },
  },
  nl: {
    lang: "nl", dir: "ltr", label: "Nederlands",
    channels: [{ id: "email", text: "E-mail ons" }],
    ctaNote: "Gratis offerte binnen 24 uur · Prijzen in EUR",
    tagline: "B2B-inkoop en export uit Turkije",
    home: "Start", navLabel: "Navigatie", switcherLabel: "Taal",
    contact: {
      title: "Neem contact op",
      body: "Wij werken per e-mail: direct en zonder omwegen. Stuur uw aanvraag met product en doelprijs en ontvang binnen 24 uur een gratis offerte. Prijzen in EUR; telefoonnummers in +31-formaat. De directe contactlink wordt geactiveerd zodra ons kanaal live is.",
    },
    sourcing: { label: "Inkoop (sourcing)" },
  },
  es: {
    lang: "es", dir: "ltr", label: "Español",
    channels: [{ id: "whatsapp", text: "WhatsApp" }],
    ctaNote: "Presupuesto gratuito en 24 horas · Precios en EUR",
    tagline: "Abastecimiento B2B y exportación desde Turquía",
    home: "Inicio", navLabel: "Navegación", switcherLabel: "Idioma",
    contact: {
      title: "Contáctenos",
      body: "Nuestro canal principal es WhatsApp. Los enlaces directos se activarán cuando el canal entre en operación; esta página se actualizará. Envíen su solicitud con el producto y el precio objetivo, y reciban un presupuesto gratuito en 24 horas. Precios en EUR (consulten también opciones para Latinoamérica). Teléfonos en formato +34.",
    },
    sourcing: { label: "Abastecimiento (sourcing)" },
  },
  ar: {
    lang: "ar", dir: "rtl", label: "العربية",
    channels: [{ id: "whatsapp", text: "واتساب للأعمال" }],
    ctaNote: "عرض سعر مجاني خلال 24 ساعة · الأسعار بالدولار الأمريكي",
    tagline: "التوريد والتصدير بين الشركات من تركيا",
    home: "الرئيسية", navLabel: "التنقل", switcherLabel: "اللغة",
    contact: {
      title: "تواصلوا معنا",
      body: "قناتنا الرئيسية هي واتساب للأعمال (WhatsApp Business). سيتم تفعيل الروابط المباشرة فور تشغيل القناة، وستُحدَّث هذه الصفحة. أرسلوا طلبكم مع وصف المنتج والسعر المستهدف، وسنرد خلال 24 ساعة. الأسعار بالدولار الأمريكي مع إمكانية الإشارة إلى الدرهم الإماراتي (AED) أو الريال السعودي (SAR) حسب سوقكم.",
    },
    sourcing: { label: "التوريد" },
  },
};

/** Sayfa tipi → mevcut karşılıklar. Olmayan karşılık listeye GİRMEZ (404-hreflang yasağı UI'da da — lang-switcher.md). */
export type VariantPage = "home" | "sourcing";

export interface SwitcherItem { code: string; hreflang: string; label: string; href: string; lang: string }

export function switcherItems(page: VariantPage): SwitcherItem[] {
  const items: SwitcherItem[] = [];
  // İngilizce karşılık: home → /en, sourcing → /en/services/sourcing (Step 2.1 ✅ mevcut). Karşılık VAR ise listelenir;
  // her switcher hedefinin out/'ta bulunduğunu lib/ui/variants.smoke.test.mjs doğrular (404'a link yok).
  items.push(
    page === "home"
      ? { code: "en", hreflang: "en", label: "English", href: "/en", lang: "en" }
      : { code: "en", hreflang: "en", label: "English", href: "/en/services/sourcing", lang: "en" },
  );
  for (const v of enVariants) {
    const path = page === "home" ? `/en/${v}` : `/en/${v}/services/sourcing`;
    items.push({ code: v, hreflang: v, label: VARIANTS[v].label, href: path, lang: VARIANTS[v].lang });
  }
  return items;
}
