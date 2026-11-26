// /en/ar/wooden-utility-poles — صفحة هبوط وتوليد عملاء (B2B Lead Funnel) لتوريد أعمدة الكهرباء والاتصالات الخشبية من المصنع مباشرة
// الأولوية #1: ليبيا (مصراتة، طرابلس، بنغازي، الخمس) · الأولوية #2: الأردن (العقبة/عمّان) · العراق ومصر والمغرب العربي.
// بدون وسطاء أو سماسرة · خط واتساب الرسمي الوحيد: +90 539 414 78 54 (lib/ui/entities.ts).
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Globe, MessageCircle, ShieldCheck } from "lucide-react";
import Hero from "@/lib/ui/Hero";
import StatBand from "@/lib/ui/StatBand";
import { Section, SectionHeader } from "@/lib/ui/Section";
import UtilityPoleFunnel, { PoleHeroVideoShowcase, type UtilityPoleFunnelCopy } from "@/lib/ui/UtilityPoleFunnel";
import WhatsAppFloat from "@/lib/ui/WhatsAppFloat";
import Reveal from "@/lib/ui/motion/Reveal";
import { CORPORATE_ENTITIES, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, SAP_ARIBA_ID, SAP_ARIBA_PROFILE_URL, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";
import { SeoJsonLd, SITE_URL, buildProductFunnelGraph, defaultOpenGraph } from "@/lib/seo/schema";
import ps from "@/lib/seo/proposal.module.css";
import up from "@/lib/ui/utilitypole.module.css";

const PAGE_PATH = "wooden-utility-poles";
const PAGE_URL = `${SITE_URL}/en/ar/${PAGE_PATH}`;
const OG_IMG = `${SITE_URL}/media/poles/wooden-utility-poles-og.webp`;

// ≤ 60 karakter kuralı (53 karakter) + 120–158 karakter meta description (Google Autocomplete: أعمدة كهرباء خشبية للبيع ليبيا)
const META_TITLE = "أعمدة كهرباء خشبية للبيع (ليبيا والأردن) | مصنع مباشر";
const META_DESC =
  "أعمدة كهرباء واتصالات خشبية للبيع من مصنعنا في تركيا مباشرة إلى ليبيا (مصراتة/طرابلس/بنغازي) والأردن والعراق. 140 عمود 9م بالحاوية · D-U-N-S & SAP Ariba.";

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESC,
  alternates: variantAlternates("ar", PAGE_PATH),
  ...defaultOpenGraph({
    title: META_TITLE,
    description: META_DESC,
    url: PAGE_URL,
    locale: "ar_LY",
    image: OG_IMG,
  }),
};

const CORRIDORS_AR = [
  {
    id: "libya",
    priority: true,
    badge: "الأولوية #1 — السوق الليبي",
    transit: "شحن بحري مباشر 3–6 أيام من تركيا",
    title: "ليبيا: توريد مباشر لمشاريع الكهرباء والاتصالات (مصراتة · طرابلس · بنغازي)",
    desc: "نورّد أعمدة الكهرباء والهاتف الخشبية المشربة بالضغط والتفريغ مباشرة من خط إنتاجنا في تركيا إلى مقاولي الشركة العامة للكهرباء (GECOL)، وشركات الاتصالات والألياف الضوئية، ومشاريع إعادة الإعمار والبلديات في طرابلس ومصراتة وبنغازي والخمس وزليتن وسبها دون أي وسيط تجاري.",
    ports: ["ميناء مصراتة", "ميناء طرابلس", "ميناء بنغازي", "ميناء الخمس"],
    cta: "اطلب تسعيرة CIF مصراتة / طرابلس / بنغازي عبر واتساب",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة الكهرباء الخشبية (9 متر بني مشرب بالأوتوكلاف - 140 عمود/حاوية 40 قدم) تسليم CIF ميناء مصراتة / طرابلس / بنغازي - ليبيا.",
  },
  {
    id: "jordan",
    priority: false,
    badge: "الممر الرئيسي #2 — الأردن",
    transit: "شحن منتظم إلى ميناء العقبة أو برياً",
    title: "الأردن: أعمدة توزيع كهربائي واتصالات مطابقة للمواصفات (العقبة · عمّان)",
    desc: "توريد مباشر لمقاولي شركات توزيع الكهرباء في المملكة الأردنية الهاشمية (JEPCO / EDCO / IDECO) ومشاريع الشبكات الريفية والطاقة والاتصالات، مع شهادة منشأ، وشهادة صحة نباتية، وتقرير دورة الأوتوكلاف لكل شحنة.",
    ports: ["ميناء العقبة", "عمّان / المنطقة الحرة بالزرقاء", "إربد والمفرق"],
    cta: "اطلب تسعيرة CIF العقبة / عمّان عبر واتساب",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة الكهرباء والاتصالات الخشبية تسليم ميناء العقبة - الأردن مع المواصفات الفنية وشهادات التشريب.",
  },
  {
    id: "iraq",
    priority: false,
    badge: "شحن بري مباشر أو بحري",
    transit: "3–5 أيام برياً عبر إبراهيم الخليل",
    title: "العراق: شحن بري سريع من المصنع التركي إلى كافة المحافظات",
    desc: "ميزة لوجستية استثنائية للمقاولين في العراق: شحن مباشر بالشاحنات أو الحاويات من بوابة مصنعنا عبر معبر إبراهيم الخليل إلى أربيل والموصل وبغداد والبصرة، أو بحرياً عبر ميناء أم قصر، بأطوال 7م و8م و9م و11م و12م.",
    ports: ["معبر إبراهيم الخليل البري", "أربيل / بغداد / الموصل", "ميناء أم قصر"],
    cta: "اطلب تسعيرة التوريد للعراق عبر واتساب",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة الكهرباء الخشبية مع الشحن إلى العراق (عبر إبراهيم الخليل / أم قصر).",
  },
  {
    id: "mena",
    priority: false,
    badge: "شمال أفريقيا وشرق المتوسط",
    transit: "4–10 أيام بحرياً من إزمير ومرسين",
    title: "مصر، الجزائر، تونس، ولبنان: عقود توريد بالحاويات للمشاريع",
    desc: "تجهيز سريع للطلبيات المتعددة الحاويات لشركات المقاولات الكهربائية وموردي البنية التحتية في الإسكندرية ودمياط والجزائر العاصمة ورادس/صفاقس وبيروت، مع فحص رطوبة الخشب وتوثيق التحميل عموداً بعمود.",
    ports: ["الإسكندرية / دمياط", "الجزائر / سكيكدة", "رادس / صفاقس", "بيروت"],
    cta: "اطلب تسعيرة لمنطقة الشرق الأوسط وشمال أفريقيا",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة الكهرباء والاتصالات الخشبية المشربة بالأوتوكلاف للتصدير.",
  },
] as const;

const GALLERY_AR = [
  {
    src: "/media/poles/container-loading-telehandler.webp",
    tag: "تحميل مباشر بالحاويات 40' HC",
    title: "تحميل أعمدة 9 متر البنية مباشرة من ساحة المصنع إلى الحاوية",
    sub: "معدات مناولة تلسكوبية مخصصة لتحميل الأعمدة الطويلة بأمان تام دون خدش طبقة التشريب الواقية.",
  },
  {
    src: "/media/poles/container-140-poles-tally.webp",
    tag: "140 عمود / حاوية 40 قدم",
    title: "تعبئة قياسية موثقة: 140 عموداً بطول 9 أمتار داخل الحاوية الواحدة",
    sub: "يُرقَّم ويُحصى كل عمود فردياً بالعلامات البيضاء قبل إغلاق الحاوية وتثبيت الختم الجمركي لإرساله للمشتري.",
  },
  {
    src: "/media/poles/factory-yard-autoclave-stock.webp",
    tag: "مصنع متكامل — بدون وسطاء",
    title: "ساحة الإنتاج المتكاملة: الأخشاب الخام، سكة الأوتوكلاف، والمخزون الجاهز",
    sub: "تظهر في الصورة الأعمدة الخام قبل المعالجة، وسكة عربة الأوتوكلاف، ومخزون الأعمدة البنية والخضراء الجاهزة للشحن.",
  },
  {
    src: "/media/poles/brown-9m-utility-poles-closeup.webp",
    tag: "التشريب البني للتصدير",
    title: "أعمدة كهرباء وهاتف بطول 9 أمتار بالتشريب البني الأكثر طلباً دولياً",
    sub: "خراطة وتقشير متجانس مع تشريب عميق يقاوم النمل الأبيض والفطريات وأشعة الشمس القاسية في المناخ الصحراوي.",
  },
  {
    src: "/media/poles/brown-poles-autoclave-rail.webp",
    tag: "جاهزية لعطاءات الجملة",
    title: "مخزون تصديري ضخم على خط عربة الأوتوكلاف لشحن الحاويات المتتابعة",
    sub: "قدرة إنتاجية وتخزينية تلبي عطاءات شركات الكهرباء الوطنية ومشاريع المقاولات الكبرى دون تأخير.",
  },
  {
    src: "/media/poles/export-container-dispatch-yard.webp",
    tag: "أسطول الشحن الدولي",
    title: "تجهيز الحاويات المتعددة من بوابة المصنع مباشرة إلى الموانئ التركية",
    sub: "ربط لوجستي مباشر مع خطوط الملاحة المتجهة أسبوعياً إلى مصراتة وطرابلس وبنغازي والعقبة والإسكندرية.",
  },
] as const;

const AUTOCLAVE_STEPS_AR = [
  {
    num: "01 · تجفيف مسبق",
    title: "ضبط الرطوبة ≤ 25%",
    val: "لا يدخل الخشب أسطوانة التشريب إلا بعد خفض نسبة الرطوبة إلى حد أقصى 25% (وأفران تجفيف تصل إلى 10–12%) لضمان امتصاص مثالي.",
    specId: "9m-brown",
    cta: "اختر مواصفة التجفيف والتشريب (9م بني) ←",
  },
  {
    num: "02 · التفريغ الأولي",
    title: "تفريغ 60 دقيقة (63.5 cmHg)",
    val: "سحب الهواء والعصارة من خلايا الخشب لمدة لا تقل عن 60 دقيقة كاملة تحت تفريغ 63.5 سم زئبق لفتح المسام بالكامل.",
    specId: "7m-8m-brown-green",
    cta: "اطلب أعمدة مشربة بالتفريغ الكامل (7م–8م) ←",
  },
  {
    num: "03 · الغمر والضغط العالي",
    title: "ضغط هيدروليكي ≥ 10.5 كجم/سم²",
    val: "ملء الأسطوانة بمحلول التشريب تحت التفريغ ثم تطبيق ضغط لا يقل عن 10.5 كجم/سم² لإشباع الخشب بالمادة الحافظة.",
    specId: "10m-12m-green",
    cta: "اختر أعمدة الضغط العالي للجهد المتوسط (10م–12م) ←",
  },
  {
    num: "04 · التركيز والتغلغل",
    title: "16 كجم/م³ ملح جاف · تغلغل ≥ 75%",
    val: "تركيز محلول 3.5% (350 لتر/م³ = 16 كجم/م³ ملح جاف) بحرارة أقل من 30°C، وتغلغل في 75% من الخشب العصاري (≥ 20–40 مم) يليها تفريغ نهائي 15 دقيقة.",
    specId: "mixed-tender",
    cta: "اطلب شهادة دفعة الأوتوكلاف لعطائك (BOQ) ←",
  },
] as const;

const DIMENSION_ROWS_AR = [
  {
    lengthLabel: "7.0 m",
    topDia: "Ø 11 – 13 cm",
    buttDia: "Ø 18 – 20 cm",
    treatment: "تشريب بني أو أخضر",
    capacity: "~180 – 195 عمود",
    usage: "خطوط الهاتف، الألياف الضوئية، والتوزيع الفرعي",
    specId: "7m-8m-brown-green",
    notes: "مقاس 7.0 متر (قمة 11-13 سم / قاعدة 18-20 سم — ~185 عمود بالحاوية)",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة خشبية بطول 7.0 متر (تشريب بني/أخضر — ~185 عمود بالحاوية 40' HC).",
  },
  {
    lengthLabel: "8.0 m",
    topDia: "Ø 12 – 14 cm",
    buttDia: "Ø 20 – 22 cm",
    treatment: "تشريب بني أو أخضر",
    capacity: "~155 – 170 عمود",
    usage: "شبكات الجهد المنخفض وإنارة البلديات والقرى",
    specId: "7m-8m-brown-green",
    notes: "مقاس 8.0 متر (قمة 12-14 سم / قاعدة 20-22 سم — ~165 عمود بالحاوية)",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة كهرباء خشبية بطول 8.0 متر (تشريب بني/أخضر — ~165 عمود بالحاوية 40' HC).",
  },
  {
    lengthLabel: "9.0 m (قياسي للتصدير)",
    topDia: "Ø 12 – 14 cm",
    buttDia: "Ø 22 – 23 cm",
    treatment: "تشريب بني (الأكثر طلباً) أو أخضر",
    capacity: "140 عمود (موثق)",
    usage: "المقاس الرئيسي لشبكات توزيع الكهرباء في ليبيا والأردن",
    specId: "9m-brown",
    flagship: true,
    notes: "مقاس 9.0 متر تشريب بني قياسي (140 عمود بالحاوية 40' HC)",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة كهرباء خشبية بطول 9.0 متر تشريب بني قياسي (140 عمود بالحاوية 40' HC).",
  },
  {
    lengthLabel: "10.0 m – 11.0 m",
    topDia: "Ø 14 – 16 cm",
    buttDia: "Ø 24 – 27 cm",
    treatment: "تشريب أخضر حصراً",
    capacity: "~95 – 110 عمود",
    usage: "خطوط الجهد المتوسط ومعابر الطرق الرئيسية",
    specId: "10m-12m-green",
    notes: "مقاس 10-11 متر تشريب أخضر للجهد المتوسط (~100 عمود بالحاوية)",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة كهرباء خشبية بطول 10م / 11م (تشريب أخضر للجهد المتوسط — ~100 عمود بالحاوية 40' HC).",
  },
  {
    lengthLabel: "12.0 m",
    topDia: "Ø 15 – 17 cm",
    buttDia: "Ø 26 – 30 cm",
    treatment: "تشريب أخضر حصراً",
    capacity: "~80 – 90 عمود (تستيف خاص)",
    usage: "خطوط النقل الهوائية الثقيلة والمسافات الطويلة",
    specId: "10m-12m-green",
    notes: "مقاس 12.0 متر تشريب أخضر للخطوط الثقيلة (~85 عمود بالحاوية)",
    waText:
      "السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة كهرباء خشبية بطول 12.0 متر (تشريب أخضر للخطوط الهوائية الثقيلة — ~85 عمود بالحاوية 40' HC).",
  },
] as const;

const MENA_UTILITY_SPECS_AR = [
  {
    id: "gecol-libya",
    authority: "الشركة العامة للكهرباء (GECOL) وشركة هاتف ليبيا — ليبيا",
    standard: "EN 14229 / BS 1990-1 · فئة الاستخدام C4 (ملامسة التربة)",
    lengths: "9.0m (تشريب بني · 140/حاوية) + 10.5m/11m (أخضر للجهد المتوسط)",
    retention: "16 كجم/م³ ملح جاف · ضغط ≥ 10.5 كجم/سم² · رطوبة ≤ 25%",
    ports: "مصراتة · طرابلس · بنغازي · الخمس (شحن بحري 3–6 أيام)",
    specId: "9m-brown",
    destId: "libya-misrata-tripoli",
    notes: "مطابقة مواصفات الشركة العامة للكهرباء ليبيا (GECOL) / هاتف ليبيا",
    waText:
      "السلام عليكم، نطلب عرض سعر مصنع مباشر لأعمدة خشبية مطابقة لمواصفات الشركة العامة للكهرباء ليبيا (GECOL / هاتف ليبيا) تسليم CIF مصراتة / طرابلس / بنغازي.",
  },
  {
    id: "jepco-edco-jordan",
    authority: "شركة الكهرباء الأردنية (JEPCO) و EDCO و IDECO — الأردن",
    standard: "BS 1990-1 / EN 14229 / TS EN 351-1 · تغلغل العصارة ≥ 75%",
    lengths: "7.0m / 8.0m / 9.0m (بني أو أخضر) + 11.0m (أخضر)",
    retention: "16 كجم/م³ ملح جاف + شهادة دورة أوتوكلاف ومنشأ وصحة نباتية",
    ports: "ميناء العقبة / المنطقة الحرة بالزرقاء / عمّان (5–9 أيام)",
    specId: "9m-brown",
    destId: "jordan-aqaba",
    notes: "مطابقة مواصفات عطاءات JEPCO / EDCO / IDECO — الأردن",
    waText:
      "السلام عليكم، نطلب عرض سعر مصنع مباشر لأعمدة كهرباء واتصالات خشبية مطابقة لمواصفات شركات توزيع الكهرباء في الأردن (JEPCO / EDCO / IDECO) تسليم العقبة / عمّان.",
  },
  {
    id: "sonelgaz-algeria",
    authority: "سونلغاز (Sonelgaz) واتصالات الجزائر (Algérie Télécom) — الجزائر",
    standard: "NF EN 14229 / NF B 52-001 · معالجة أوتوكلاف الفئة الرابعة",
    lengths: "8.0m / 9.0m (بني تصديري) + 10.0m / 12.0m (أخضر)",
    retention: "16 كجم/م³ ملح جاف مقاوم لرطوبة الساحل والنمل الأبيض الصحراوي",
    ports: "ميناء الجزائر · سكيكدة · وهران · عنابة (4–8 أيام بحرياً)",
    specId: "7m-8m-brown-green",
    destId: "maghreb-algeria-tunisia",
    notes: "مطابقة دفتر شروط سونلغاز (Sonelgaz) / اتصالات الجزائر",
    waText:
      "السلام عليكم، نطلب عرض سعر مصنع مباشر لأعمدة خشبية مطابقة لدفتر شروط سونلغاز (Sonelgaz) واتصالات الجزائر تسليم CIF ميناء الجزائر / سكيكدة / وهران.",
  },
  {
    id: "iraq-egypt-steg",
    authority: "وزارة الكهرباء العراقية · شركات توزيع الكهرباء المصرية · STEG تونس",
    standard: "EN 14229 / ISO 9001 & 14001 · ترقيم فردي وفحص SGS/BV",
    lengths: "تشكيلة عطاءات كاملة 7.0m حتى 12.0m حسب جدول الكميات (BOQ)",
    retention: "16 كجم/م³ ملح جاف · فحص رطوبة فردي قبل التحميل",
    ports: "إبراهيم الخليل / أم قصر (العراق) · الإسكندرية / دمياط · رادس",
    specId: "mixed-tender",
    destId: "iraq-overland",
    notes: "تجهيز عطاء كهرباء/اتصالات حسب جدول الكميات (العراق / مصر / تونس)",
    waText:
      "السلام عليكم، نطلب عرض سعر مصنع مباشر لتوريد أعمدة كهرباء خشبية وفق جدول كميات العطاء (العراق / مصر / تونس) مع شهادات الاختبار والمنشأ.",
  },
] as const;

const FUNNEL_COPY_AR: UtilityPoleFunnelCopy = {
  eyebrow: "مكتب مبيعات المصنع المباشر · عرض سعر خلال 24 ساعة",
  title: "احسب حمولة الحاويات واطلب عرض سعر رسمي (Proforma Invoice) مباشرة من المصنع",
  lead: "اختر طول العمود ونوع التشريب وعدد الحاويات وميناء الوصول في ليبيا أو الأردن أو الدول العربية، ثم أرسل طلبك مباشرة إلى مهندس التصدير عبر واتساب الرسمي للمصنع بدون أي وسيط.",
  step1Label: "1. اختر مواصفة العمود ونوع التشريب بالأوتوكلاف",
  specs: [
    {
      id: "9m-brown",
      title: "عمود 9 متر — تشريب بني للتصدير (الأكثر مبيعاً)",
      tag: "140 عمود / حاوية 40' HC",
      meta: "قطر القمة Ø12–14 سم · قطر القاعدة Ø22–23 سم · تشريب أوتوكلاف بني قياسي للتصدير",
      polesPerContainer: 140,
      treatmentNote: "بني (متاح حتى 9م) أو أخضر",
    },
    {
      id: "7m-8m-brown-green",
      title: "عمود 7 متر أو 8 متر — شبكات التوزيع المنخفض والاتصالات",
      tag: "~175 عمود / حاوية 40' HC",
      meta: "متاح بالتشريب البني أو الأخضر · مثالي لخطوط الهاتف والألياف الضوئية والإنارة الفرعية",
      polesPerContainer: 175,
      treatmentNote: "بني أو أخضر (أوتوكلاف كامل)",
    },
    {
      id: "10m-12m-green",
      title: "عمود 10م / 11م / 12م — تشريب أخضر للجهد المتوسط",
      tag: "~95 عمود / حاوية 40' HC",
      meta: "مخصص لخطوط التوزيع الرئيسية والتقاطعات · يُنتج بالتشريب الأخضر حصراً للأطوال فوق 9 أمتار",
      polesPerContainer: 95,
      treatmentNote: "أخضر حصراً للأطوال > 9 متر",
    },
    {
      id: "mixed-tender",
      title: "تشكيلة أطوال مخصصة لعطاء كهرباء أو اتصالات (7م–12م)",
      tag: "جدول كميات BOQ",
      meta: "تجهيز وفق جدول كميات العطاء الحكومي أو الخاص مع شهادات الاختبار والمنشأ",
      polesPerContainer: 140,
      treatmentNote: "حسب جدول كميات المشروع (BOQ)",
    },
  ],
  step2Label: "2. حدد الكمية المطلوبة (عدد الحاويات 40 قدم High Cube)",
  volumes: [
    { id: "1x40hc", label: "1 حاوية 40' HC (دفعة تجريبية / سريعة)", containers: 1 },
    { id: "3x40hc", label: "2 – 5 حاويات (مخزون مقاول)", containers: 3 },
    { id: "8x40hc", label: "5 – 10 حاويات (مشروع شبكة)", containers: 8 },
    { id: "20x40hc", label: "+10 حاويات / عطاء سنوي كبير", containers: 20 },
  ],
  incotermLabel: "3. شروط التسليم التجاري (Incoterms)",
  incoterms: ["CIF ميناء الوصول", "CFR ميناء الوصول", "FOB ميناء تركي", "EXW تسليم بوابة المصنع"],
  step3Label: "4. اختر الدولة وميناء الوصول (ليبيا أولاً ثم الأردن والمنطقة العربية)",
  destinations: [
    { id: "libya-misrata-tripoli", label: "ليبيا (مصراتة / طرابلس / بنغازي)", portSummary: "مصراتة / طرابلس / بنغازي (3–6 أيام بحرياً)" },
    { id: "jordan-aqaba", label: "الأردن (ميناء العقبة / عمّان)", portSummary: "ميناء العقبة — المملكة الأردنية الهاشمية" },
    { id: "iraq-overland", label: "العراق (إبراهيم الخليل / أم قصر)", portSummary: "شحن بري مباشر أو ميناء أم قصر" },
    { id: "egypt-alexandria", label: "مصر (الإسكندرية / دمياط)", portSummary: "ميناء الإسكندرية / دمياط" },
    { id: "maghreb-algeria-tunisia", label: "الجزائر / تونس / المغرب", portSummary: "الجزائر / رادس / الدار البيضاء" },
    { id: "other-arab", label: "دولة عربية أخرى", portSummary: "تحديد الميناء في الملاحظات" },
  ],
  calcLabels: {
    estimatedLoad: "إجمالي الأعمدة التقديري",
    polesUnit: "عمود خشبي",
    treatmentRule: "خيار التشريب المتاح",
    selectedPort: "مسار الشحن المختار",
  },
  fields: {
    companyLabel: "اسم الشركة / المقاول / الجهة المشترية",
    companyPlaceholder: "مثال: شركة المقاولات الكهربائية — طرابلس / مصراتة / عمّان",
    whatsappLabel: "رقم واتساب للتواصل السريع (مع مفتاح الدولة)",
    whatsappPlaceholder: "+218 91 ... / +962 79 ...",
    emailLabel: "البريد الإلكتروني الرسمي (اختياري لإرسال الفاتورة المبدئية PDF)",
    emailPlaceholder: "procurement@company.ly",
    portCustomLabel: "ميناء التفريغ المحدد أو المدينة (اختياري)",
    portCustomPlaceholder: "مثال: ميناء مصراتة، بنغازي، العقبة، بغداد...",
    notesLabel: "ملاحظات فنية (الأطوال المطلوبة، القطر العلوي/السفلي، رقم العطاء، طريقة الدفع)",
    notesPlaceholder: "أدخل تفاصيل الكميات أو المواصفة الفنية المطلوبة...",
  },
  briefHeader: "ملخص طلب عرض السعر الجاهز للإرسال للمصنع",
  slaBadge: "رد هندسي وتسعير خلال 24 ساعة",
  briefLabels: {
    header: "[طلب عرض سعر مصنع مباشر — أعمدة كهرباء واتصالات خشبية · BDIMEXPORT]",
    spec: "المواصفة المختارة",
    volume: "حجم الطلبية",
    estimatedQty: "العدد التقديري",
    incoterm: "شرط التسليم",
    destination: "الوجهة / الميناء",
    company: "الشركة المشترية",
    whatsapp: "رقم واتساب المشتري",
    email: "البريد الإلكتروني",
    notes: "ملاحظات فنية",
  },
  whatsappCta: "إرسال الطلب فوراً عبر واتساب المصنع",
  emailCta: "طلب فاتورة مبدئية رسمية (Email)",
  copyCta: "نسخ تفاصيل الطلب",
  copiedCta: "تم النسخ بنجاح",
  emailSubject: "طلب عرض سعر مصنع مباشر — أعمدة كهرباء خشبية",
  directFactoryGuarantee: "تعاقد وتوريد مباشر من المصنع في تركيا دون وسطاء",
  submittedMsg: "تم تسجيل طلبكم بنجاح في نظام المصنع.",
};

const FAQ_AR = [
  {
    q: "هل أنتم المصنع المباشر لأعمدة الكهرباء الخشبية أم شركة وساطة تجارية؟",
    a: "نحن جهة التصنيع والتصدير المباشر من منشأتنا الصناعية المتكاملة في تركيا عبر كياننا القانوني التركي (BD Sanayi İthalat İhracat Şirketi) وذراع التعاقد الدولي (BDIMEXPORT LLC — المسجلة في Dun & Bradstreet برقم D-U-N-S®: 14-977-6743 وفي شبكة SAP Business Network / SAP Ariba برقم: BNO-100000188010374). تتم عمليات التقشير، والتجفيف الحراري، والخراطة، والتشريب داخل أسطوانات الأوتوكلاف، وتحميل الحاويات في ساحة مصنعنا مباشرة دون أي سماسرة أو عمولات وسطاء.",
  },
  {
    q: "كم عدد أعمدة الكهرباء بطول 9 أمتار التي تتسع لها حاوية 40 قدم؟",
    a: "تتسع الحاوية القياسية مقاس 40 قدم عالي الارتفاع (40' High Cube) لعدد 140 عموداً خشبياً بطول 9 أمتار من الفئة التصديرية القياسية (قطر القمة العلوية 12–14 سم وقطر القاعدة السفلية 22–23 سم). يتم ترقيم كل عمود وعدّه وتصويره داخل الحاوية قبل الإغلاق الرسمي.",
  },
  {
    q: "لماذا يتوفر التشريب البني حتى طول 9 أمتار بينما يتوفر الأخضر حتى 12 متراً؟",
    a: "تفضل معظم أسواق التصدير في ليبيا والأردن وأفريقيا اللون البني لأعمدة الكهرباء والاتصالات. أسطوانة الأوتوكلاف المخصصة للتشريب البني في مصنعنا تستوعب أطوالاً حتى 9 أمتار كحد أقصى (7م، 8م، 9م). أما للأطوال الأكبر (10م، 11م، 12م) فتوفر أسطوانة التشريب الأخضر معالجة كاملة بنفس معايير الضغط والتغلغل.",
  },
  {
    q: "كم يستغرق الشحن البحري إلى موانئ ليبيا (مصراتة، طرابلس، بنغازي) وميناء العقبة في الأردن؟",
    a: "تتميز تركيا بقرب جغرافي مباشر من ليبيا وشرق المتوسط؛ حيث تستغرق الرحلة البحرية المباشرة بالحاويات من موانئ إزمير أو جيمليك أو مرسين إلى مصراتة وطرابلس وبنغازي ما بين 3 إلى 6 أيام إبحار فقط، وإلى ميناء العقبة في الأردن ما بين 5 إلى 9 أيام.",
  },
  {
    q: "ما هي المواصفة الفنية لعملية التشريب بالأوتوكلاف ومقاومة العوامل الجوية والنمل الأبيض؟",
    a: "تُنفَّذ المعالجة وفق بروتوكول صارم: رطوبة أولية لا تتجاوز 25%، تفريغ أولي لمدة 60 دقيقة عند 63.5 سم زئبق، غمر كامل بالمحلول، ثم ضغط هيدروليكي لا يقل عن 10.5 كجم/سم² بتركيز 3.5% (امتصاص 350 لتر/م³ أي 16 كجم/م³ ملح جاف) وتغلغل لا يقل عن 75% من الخشب العصاري، مما يمنح العمود عمراً تشغيلياً يتجاوز 40 إلى 50 عاماً.",
  },
  {
    q: "ما الوثائق الرسمية المرفقة للتخليص الجمركي وعطاءات شركات الكهرباء؟",
    a: "نرفق مع كل شحنة: الفاتورة التجارية وقائمة التعبئة المرقمة، بوليصة الشحن البحري (B/L)، شهادة المنشأ التركية المصدقة، شهادة الصحة النباتية (Phytosanitary Certificate)، شهادة المطابقة والجودة (ISO 9001 / ISO 14001 / TS EN)، وتقرير دورة التشريب في الأوتوكلاف، مع الترحيب بأي فحص مستقل قبل الشحن (SGS / BV).",
  },
];

export default function ArWoodenUtilityPolesPage() {
  const graph = buildProductFunnelGraph({
    url: PAGE_URL,
    inLanguage: "ar",
    title: META_TITLE,
    description: META_DESC,
    productName: "أعمدة الكهرباء والاتصالات الخشبية المشربة بالأوتوكلاف لأسواق ليبيا والأردن والجزائر (7م – 12م)",
    sku: "BD-POLE-AR-MENA",
    mpn: "BD-POLE-AR-MENA-GECOL-JEPCO",
    productId: `${PAGE_URL}#BD-POLE-AR-MENA`,
    category: "أعمدة الكهرباء والاتصالات الخشبية المشربة بالأوتوكلاف (HS 4403.11 / 4403.21 · EN 14229)",
    image: OG_IMG,
    areaServed: ["LY", "JO", "DZ", "IQ", "EG", "TN", "SA", "AE", "LB", "MA"],
    crumbs: [
      { name: "الرئيسية", url: `${SITE_URL}/en/ar` },
      { name: "أعمدة الكهرباء والاتصالات الخشبية من المصنع (BD-POLE-AR-MENA)", url: PAGE_URL },
    ],
    faq: FAQ_AR,
  });

  const directWaHero = `${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(
    "السلام عليكم، أتواصل معكم بخصوص توريد أعمدة الكهرباء والاتصالات الخشبية من المصنع مباشرة (ليبيا / الأردن). نرجو إرسال الأسعار والمواصفات.",
  )}`;

  const stats = [
    { value: 140, label: "عمود 9 متر في كل حاوية 40 قدم (40' HC)" },
    { value: 10.5, decimals: 1, unit: " kg/cm²", label: "ضغط التشريب الصناعي داخل الأوتوكلاف" },
    { value: 16, unit: " kg/m³", label: "احتباس الملح الجاف المقاوم للتعفن والنمل الأبيض" },
    { value: 24, unit: " ساعة", label: "إصدار عرض سعر المصنع والفاتورة المبدئية" },
  ];

  return (
    <main>
      <SeoJsonLd graph={graph} />

      <div className={up.langBar}>
        <div className={`container ${up.langBarInner}`}>
          <span className={up.factoryBadge}>
            <Factory aria-hidden="true" className={up.badgeIcon} />
            <span>من المصنع التركي مباشرة بدون وسطاء · شحن سريع إلى مصراتة وطرابلس وبنغازي والعقبة</span>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-3)" }}>
            <Link
              id="cta-pole-ar-switch-en"
              href="/en/wooden-utility-poles"
              lang="en"
              hrefLang="en"
              className={up.langSwitchLink}
              data-clarity-event="pole_ar_switch_to_en"
            >
              <Globe aria-hidden="true" className={up.badgeIcon} />
              <span>English (Africa &amp; Global)</span>
            </Link>
            <Link
              id="cta-pole-ar-switch-fr"
              href="/en/fr/wooden-utility-poles"
              lang="fr"
              hrefLang="fr"
              className={up.langSwitchLink}
              data-clarity-event="pole_ar_switch_to_fr"
            >
              <Globe aria-hidden="true" className={up.badgeIcon} />
              <span>Français (Sénégal &amp; Afrique)</span>
            </Link>
          </div>
        </div>
      </div>

      <Hero
        id="poles-ar-hero"
        eyebrow="توريد مصنعي مباشر بدون وسطاء · ليبيا (مصراتة · طرابلس · بنغازي) والأردن (العقبة) والمنطقة العربية"
        title="أعمدة الكهرباء والاتصالات الخشبية المشربة بالأوتوكلاف — من خط إنتاج مصنعنا في تركيا إلى مينائكم"
        subtitle="احصلوا على أسعار بوابة المصنع المباشرة لأعمدة التوزيع الكهربائي والهاتف والألياف الضوئية بأطوال 7م حتى 12م (تشريب بني تصديري حتى 9م وتشريب أخضر حتى 12م)، بتعبئة قياسية 140 عموداً (9م) في الحاوية الواحدة وشحن بحري خلال 3–6 أيام إلى ليبيا."
        primary={{
          id: "cta-pole-ar-hero-calc",
          label: "احسب الكمية واطلب تسعيرة المصنع",
          href: "#contact",
          clarityEvent: "pole_ar_hero_scroll_calc",
        }}
        secondary={{
          id: "cta-pole-ar-hero-wa",
          label: "تواصل فوري عبر واتساب المصنع",
          href: directWaHero,
          clarityEvent: "pole_ar_hero_whatsapp",
          clarityUpgrade: "pole_ar_hero_wa_lead",
        }}
        trust={[
          "بدون وسطاء أو سماسرة: تعاقد مباشر مع الشركة المصنعة والمصدرة في تركيا",
          "تعبئة موثقة بالصور والعدّ الفردي: 140 عمود (9م · قمة Ø12–14 سم · قاعدة Ø22–23 سم) بكل حاوية 40' HC",
          "تشريب ضغط وتفريغ ≥ 10.5 كجم/سم² (16 كجم/م³ ملح جاف) مطابق لعطاءات الكهرباء والاتصالات",
        ]}
        visual={
          <PoleHeroVideoShowcase
            liveBadge="فيديو حقيقي من ساحة مصنعنا — تحميل أعمدة 9م"
            posterAlt="تحميل أعمدة الكهرباء الخشبية البنية بطول 9 أمتار داخل حاوية 40 قدم في المصنع"
            rfqAnchor="#contact"
            specs={[
              { val: "7m – 12m", label: "أطوال الشبكات الكهربائية والهاتفية (اضغط للحساب)", href: "#contact" },
              { val: "140 / 40' HC", label: "حمولة الحاوية الواحدة لأعمدة 9 متر (اضغط للتسعير)", href: "#contact" },
              { val: "+90 539 414 78 54", label: "خط واتساب التصدير المباشر", href: directWaHero },
            ]}
          />
        }
      />

      <StatBand items={stats} label="مؤشرات القدرة التصنيعية والتصديرية" locale="ar" />

      <Section id="arab-corridors">
        <Reveal>
          <SectionHeader
            id="arab-corridors"
            eyebrow="مسارات التصدير المباشر للأسواق العربية"
            title="حلول شحن وتوريد مصممة خصيصاً لليبيا والأردن والعراق وشمال أفريقيا"
            lead="بفضل موقع مصنعنا في تركيا وارتباطنا الأسبوعي بموانئ إزمير وجيمليك ومرسين، نوفر أسرع زمن توصيل وأقل تكلفة شحن بحري وبري مقارنةً بالمناشئ البعيدة."
          />
        </Reveal>

        <div className={up.corridorGrid}>
          {CORRIDORS_AR.map((c) => (
            <article key={c.id} className={`${up.corridorCard} ${c.priority ? up.corridorPriority : ""}`}>
              <div className={up.corridorTop}>
                <div className={up.corridorTagRow}>
                  <span className={`${up.corridorBadge} ${c.priority ? up.corridorBadgeGold : ""}`}>{c.badge}</span>
                  <span className={up.corridorTransit}>{c.transit}</span>
                </div>
                <h3 className={up.corridorTitle}>{c.title}</h3>
                <p className={up.corridorDesc}>{c.desc}</p>
                <ul className={up.portList} aria-label="موانئ التسليم">
                  {c.ports.map((p) => (
                    <li key={p} className={up.portChip}>{p}</li>
                  ))}
                </ul>
              </div>
              <a
                id={`cta-pole-ar-corridor-${c.id}`}
                href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(c.waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${up.corridorWaLink} ${c.priority ? up.corridorWaPriority : ""}`}
                data-clarity-event={`pole_ar_corridor_wa_${c.id}`}
                data-clarity-upgrade={`pole_ar_${c.id}_wa_lead`}
                data-clarity-tag={`pole_corridor:${c.id}`}
              >
                <MessageCircle aria-hidden="true" className={up.btnIcon} />
                <span>{c.cta}</span>
                <ArrowRight aria-hidden="true" className={up.dirArrow} />
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section id="factory-gallery" tone="alt">
        <Reveal>
          <SectionHeader
            id="factory-gallery"
            eyebrow="توثيق ميداني من أرض المصنع وساحة التحميل"
            title="صور حقيقية لخطوط التشريب ومخزون الأعمدة البنية وتحميل الحاويات"
            lead="لا نستخدم صوراً دعائية مستعارة؛ كافة الصور أدناه ملتقطة فعلياً أثناء تجهيز وتحميل طلبيات التصدير من ساحة مصنعنا في تركيا."
          />
        </Reveal>

        <div className={up.galleryGrid}>
          {GALLERY_AR.map((img, idx) => (
            <figure
              key={img.src}
              id={`pole-ar-gallery-${idx + 1}`}
              className={up.galleryCard}
              data-clarity-event={`pole_ar_gallery_${idx + 1}`}
            >
              <div className={up.galleryImgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className={up.galleryImg} loading="lazy" decoding="async" />
                <span className={up.galleryTag}>{img.tag}</span>
              </div>
              <figcaption className={up.galleryCaption}>
                <strong className={up.galleryTitle}>{img.title}</strong>
                <span className={up.gallerySub}>{img.sub}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="technical-specs">
        <Reveal>
          <SectionHeader
            id="technical-specs"
            eyebrow="جدول المقاسات وحمولة الحاويات ونوع المعالجة (اضغط على أي مقاس لطلب تسعيرته)"
            title="المواصفات الهندسية لأعمدة الكهرباء والاتصالات الخشبية (7م – 12م)"
            lead="ننتج الأعمدة الخشبية المخروطة والمقشرة وفق متطلبات شركات الكهرباء والاتصالات، مع إمكانية النقر المباشر على أي مقاس أدناه لاختياره تلقائياً في حاسبة الحاويات أو طلب تسعيرته عبر واتساب."
          />
        </Reveal>

        <div className={ps.tableWrap}>
          <table className={ps.table}>
            <thead>
              <tr>
                <th>طول العمود</th>
                <th>قطر القمة (العلوي)</th>
                <th>قطر القاعدة (السفلي)</th>
                <th>خيارات التشريب المتاحة</th>
                <th>الحمولة القياسية (حاوية <bdi dir="ltr">40&apos; HC</bdi>)</th>
                <th>الاستخدام الرئيسي في المشاريع</th>
                <th>طلب تسعيرة هذا المقاس</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSION_ROWS_AR.map((row) => (
                <tr key={row.lengthLabel}>
                  <td className={ps.metricCell}>
                    <a
                      href="#contact"
                      data-pole-spec={row.specId}
                      data-pole-notes={row.notes}
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      <bdi dir="ltr">{row.lengthLabel}</bdi>
                    </a>
                  </td>
                  <td><bdi dir="ltr">{row.topDia}</bdi></td>
                  <td><bdi dir="ltr">{row.buttDia}</bdi></td>
                  <td>{"flagship" in row && row.flagship ? <strong>{row.treatment}</strong> : row.treatment}</td>
                  <td>{"flagship" in row && row.flagship ? <strong>{row.capacity}</strong> : row.capacity}</td>
                  <td>{row.usage}</td>
                  <td>
                    <div className={up.tableCtaCell}>
                      <a
                        href="#contact"
                        data-pole-spec={row.specId}
                        data-pole-notes={row.notes}
                        className={up.tableCalcLink}
                      >
                        <span>اختر في الحاسبة</span>
                      </a>
                      <a
                        href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(row.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={up.tableWaLink}
                        data-clarity-event={`pole_ar_table_wa_${row.specId}`}
                      >
                        <MessageCircle aria-hidden="true" className={up.badgeIcon} />
                        <span>تسعيرة واتساب</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={up.autoclaveNotice}>
          <span className={up.autoclaveNoticeTitle}>معلومة فنية مهمة للمستوردين بخصوص اللون البني والأخضر:</span>
          <p className={up.autoclaveNoticeBody}>
            يفضل المستوردون في الأسواق الخارجية اللون البني لأعمدة الكهرباء. تستوعب أسطوانة الأوتوكلاف المخصصة للتشريب البني في مصنعنا أطوالاً حتى{" "}
            <strong><bdi dir="ltr">9.0 m</bdi> كحد أقصى</strong>. وفي حال طلب أطوال <bdi dir="ltr">10 m</bdi> أو <bdi dir="ltr">11 m</bdi> أو <bdi dir="ltr">12 m</bdi>، يتم التوريد بالتشريب الأخضر عالي المقاومة دون أي قيد في الطول وبنفس كفاءة الحماية ضد التعفن والحشرات.
          </p>
        </div>
      </Section>

      <Section id="mena-utility-compliance" tone="alt">
        <Reveal>
          <SectionHeader
            id="mena-utility-compliance"
            eyebrow="مطابقة دفاتر الشروط الفنية للشركات الوطنية العربية · SKU: BD-POLE-AR-MENA"
            title="جدول مطابقة المواصفات الفنية لعطاءات GECOL (ليبيا) و JEPCO / EDCO (الأردن) و Sonelgaz (الجزائر)"
            lead="صُممت دورة التجفيف والتشريب في مصنعنا لتلبية الاشتراطات الهندسية الصارمة لشركات توزيع الكهرباء والاتصالات الوطنية في المنطقة العربية، مع مقاومة مثبتة للإجهاد الحراري الصحراوي ورطوبة السواحل."
          />
        </Reveal>

        <div className={ps.tableWrap}>
          <table className={ps.table}>
            <thead>
              <tr>
                <th>الجهة / شركة الكهرباء والاتصالات</th>
                <th>المعيار الهندسي وفئة الاستخدام</th>
                <th>الأطوال القياسية الأكثر طلباً</th>
                <th>تركيز التشريب والضمان</th>
                <th>موانئ التسليم وزمن الشحن</th>
                <th>طلب عرض سعر مطابق</th>
              </tr>
            </thead>
            <tbody>
              {MENA_UTILITY_SPECS_AR.map((item) => (
                <tr key={item.id}>
                  <td className={ps.metricCell}>{item.authority}</td>
                  <td>{item.standard}</td>
                  <td>{item.lengths}</td>
                  <td>{item.retention}</td>
                  <td>{item.ports}</td>
                  <td>
                    <div className={up.tableCtaCell}>
                      <a
                        href="#contact"
                        data-pole-spec={item.specId}
                        data-pole-dest={item.destId}
                        data-pole-notes={item.notes}
                        className={up.tableCalcLink}
                      >
                        <span>تعبئة في النموذج</span>
                      </a>
                      <a
                        href={`${OFFICIAL_WHATSAPP_WA}?text=${encodeURIComponent(item.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={up.tableWaLink}
                        data-clarity-event={`pole_ar_mena_spec_wa_${item.id}`}
                      >
                        <MessageCircle aria-hidden="true" className={up.badgeIcon} />
                        <span>واتساب العطاء</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={up.corridorGrid} style={{ marginBlockStart: "var(--s-6)" }}>
          <article className={up.corridorCard}>
            <div className={up.corridorTop}>
              <span className={up.corridorBadge}>هندسة المناخ الصحراوي والساحلي (ليبيا · الأردن · الجزائر)</span>
              <h3 className={up.corridorTitle}>مقاومة التشقق الحراري والنمل الأبيض الصحراوي (Psammotermes) والرطوبة الملحية</h3>
              <p className={up.corridorDesc}>
                تتعرض أعمدة التوزيع الهوائية في سهول الجفارة وساحل مصراتة وبنغازي ووادي الأردن والبادية والصحراء الجزائرية لتفاوت حراري حاد بين أشعة الشمس الصيفية (<bdi dir="ltr">+50°C</bdi>) وبرودة الليل، إضافةً إلى الرطوبة الملحية الساحلية ونشاط النمل الأبيض الجوفي. لذلك نُخضع كل شحنة تحمل الرمز التصنيعي <bdi dir="ltr">BD-POLE-AR-MENA</bdi> لتجفيف مسبق مضبوط (<bdi dir="ltr">≤ 25%</bdi>) يمنع التشققات الطولية بعد النصب، يليه تشريب خلية كاملة بضغط <bdi dir="ltr">≥ 10.5 kg/cm²</bdi> واحتباس <bdi dir="ltr">16 kg/m³</bdi> من الملح الجاف داخل <bdi dir="ltr">≥ 75%</bdi> من الخشب العصاري.
              </p>
            </div>
            <a
              href="#contact"
              data-pole-spec="9m-brown"
              data-pole-dest="libya-misrata-tripoli"
              data-pole-notes="طلب ملف المواصفة الفنية وشهادة الأوتوكلاف (BD-POLE-AR-MENA)"
              className={up.corridorWaLink}
            >
              <span>اطلب ملف المطابقة الهندسية وعرض السعر الآن</span>
              <ArrowRight aria-hidden="true" className={up.dirArrow} />
            </a>
          </article>

          <article className={up.corridorCard}>
            <div className={up.corridorTop}>
              <span className={up.corridorBadge}>حوكمة العطاءات والاعتمادات المستندية (L/C &amp; SAP Ariba)</span>
              <h3 className={up.corridorTitle}>تعاقد مباشر مع المصنع التركي أو عبر الكيان الأمريكي الموثق في D-U-N-S و SAP Ariba</h3>
              <p className={up.corridorDesc}>
                سواء كنتم تتقدمون لعطاء حكومي لدى الشركة العامة للكهرباء (GECOL)، أو شركات توزيع الكهرباء الأردنية (JEPCO / EDCO / IDECO)، أو سونلغاز (Sonelgaz)، نوفر لكم خيار التعاقد المباشر مع مصنعنا في تركيا (<bdi dir="ltr">{CORPORATE_ENTITIES[0].name}</bdi>) لشحنات الفاتورة المبدئية السريعة والاعتمادات المستندية، أو عبر كياننا الأمريكي (<bdi dir="ltr">{CORPORATE_ENTITIES[1].name}</bdi> · رقم <bdi dir="ltr">D-U-N-S® {US_DUNS_NUMBER}</bdi> · ومعرّف <bdi dir="ltr">SAP Ariba® {SAP_ARIBA_ID}</bdi>) للمشاريع الممولة دولياً وعقود الهندسة والمشتريات والإنشاءات (EPC).
              </p>
            </div>
            <a
              href="#contact"
              data-pole-spec="mixed-tender"
              data-pole-notes="تعاقد عطاء رسمي / جدول كميات BOQ (D-U-N-S & SAP Ariba)"
              className={up.corridorWaLink}
            >
              <span>احسب جدول كميات العطاء (BOQ) واطلب فاتورة مبدئية</span>
              <ArrowRight aria-hidden="true" className={up.dirArrow} />
            </a>
          </article>
        </div>
      </Section>

      <Section id="autoclave-protocol">
        <Reveal>
          <SectionHeader
            id="autoclave-protocol"
            eyebrow="بروتوكول المعالجة الصناعية بالضغط والتفريغ (اضغط على أي مرحلة لاختيار المواصفة)"
            title="معايير دفتر شروط التشريب بالأوتوكلاف لضمان عمر تشغيلي يتجاوز 40–50 عاماً"
            lead="على عكس المعالجة السطحية بالدهان أو الغمر البسيط، يخترق محلول التشريب في مصنعنا عمق الخشب العصاري تحت ضغط صناعي مرتفع. انقر على أي بطاقة أدناه لاختيار المواصفة المقابلة مباشرة في نموذج التسعير."
          />
        </Reveal>

        <div className={up.protocolGrid}>
          {AUTOCLAVE_STEPS_AR.map((st) => (
            <a
              key={st.num}
              href="#contact"
              data-pole-spec={st.specId}
              className={up.protocolStep}
            >
              <div>
                <span className={up.protocolNum}>{st.num}</span>
                <h3 className={up.protocolTitle}>{st.title}</h3>
                <p className={up.protocolVal}>{st.val}</p>
              </div>
              <span className={up.protocolCta}>{st.cta}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="rfq-section">
        <span id="rfq" aria-hidden="true" />
        <UtilityPoleFunnel
          copy={FUNNEL_COPY_AR}
          locale="ar"
          sourcePage="/en/ar/wooden-utility-poles"
          sectionId="contact"
        />
        <p className="chip" style={{ marginBlockStart: "var(--s-6)" }}>
          <ShieldCheck aria-hidden="true" className="chip-icon" />
          <span>
            الكيان المصنّع والمصدّر في تركيا: <bdi dir="ltr">{CORPORATE_ENTITIES[0].name}</bdi> · ذراع التعاقد الدولي: <bdi dir="ltr">{CORPORATE_ENTITIES[1].name} (D-U-N-S® #{US_DUNS_NUMBER})</bdi> ·{" "}
            <a href={SAP_ARIBA_PROFILE_URL} target="_blank" rel="noopener noreferrer" data-clarity-event="pole_ar_sap_ariba_verify">
              <bdi dir="ltr">SAP Ariba® {SAP_ARIBA_ID}</bdi>
            </a>{" "}
            · واتساب رسمي: <bdi dir="ltr">{OFFICIAL_PHONE}</bdi>
          </span>
        </p>
      </Section>

      <Section id="faq" tone="alt">
        <Reveal>
          <SectionHeader
            id="faq"
            eyebrow="إجابات مباشرة للمستوردين والمقاولين"
            title="الأسئلة الشائعة حول استيراد أعمدة الكهرباء الخشبية من مصنعنا في تركيا"
          />
        </Reveal>
        <div className={ps.faqStack}>
          {FAQ_AR.map((f) => (
            <article key={f.q} className={ps.faqItem}>
              <h3 className={ps.faqQ}>{f.q}</h3>
              <p className={ps.faqA}>{f.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <WhatsAppFloat
        locale="ar"
        label="واتساب المصنع المباشر"
        ariaLabel="تواصل عبر واتساب المصنع المباشر"
        message="السلام عليكم، نرغب في عرض سعر مصنع مباشر لأعمدة الكهرباء والاتصالات الخشبية (ليبيا / الأردن)."
      />
    </main>
  );
}
