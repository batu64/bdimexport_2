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
import { CORPORATE_ENTITIES, OFFICIAL_PHONE, OFFICIAL_WHATSAPP_WA, US_DUNS_NUMBER } from "@/lib/ui/entities";
import { variantAlternates } from "@/app/(en)/en/_lib/hreflang";
import { SeoJsonLd, SITE_URL, buildProductFunnelGraph, defaultOpenGraph } from "@/lib/seo/schema";
import ps from "@/lib/seo/proposal.module.css";
import up from "@/lib/ui/utilitypole.module.css";

const PAGE_PATH = "wooden-utility-poles";
const PAGE_URL = `${SITE_URL}/en/ar/${PAGE_PATH}`;
const OG_IMG = `${SITE_URL}/media/poles/wooden-utility-poles-og.webp`;

// ≤ 60 karakter kuralı (59 karakter) + 120–158 karakter meta description
const META_TITLE = "أعمدة الكهرباء الخشبية من المصنع لليبيا والأردن | Bdimexport";
const META_DESC =
  "مصنع تركي مباشر لأعمدة الكهرباء والاتصالات الخشبية المشربة بالأوتوكلاف (7م–12م). شحن 140 عمود 9م بالحاوية إلى مصراتة وطرابلس وبنغازي والعقبة بدون وسطاء.";

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
  },
  {
    num: "02 · التفريغ الأولي",
    title: "تفريغ 60 دقيقة (63.5 cmHg)",
    val: "سحب الهواء والعصارة من خلايا الخشب لمدة لا تقل عن 60 دقيقة كاملة تحت تفريغ 63.5 سم زئبق لفتح المسام بالكامل.",
  },
  {
    num: "03 · الغمر والضغط العالي",
    title: "ضغط هيدروليكي ≥ 10.5 كجم/سم²",
    val: "ملء الأسطوانة بمحلول التشريب تحت التفريغ ثم تطبيق ضغط لا يقل عن 10.5 كجم/سم² لإشباع الخشب بالمادة الحافظة.",
  },
  {
    num: "04 · التركيز والتغلغل",
    title: "16 كجم/م³ ملح جاف · تغلغل ≥ 75%",
    val: "تركيز محلول 3.5% (350 لتر/م³ = 16 كجم/م³ ملح جاف) بحرارة أقل من 30°C، وتغلغل في 75% من الخشب العصاري (≥ 20–40 مم) يليها تفريغ نهائي 15 دقيقة.",
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
    a: "نحن جهة التصنيع والتصدير المباشر من منشأتنا الصناعية المتكاملة في تركيا عبر كياننا القانوني التركي (BD Sanayi İthalat İhracat Şirketi) وذراع التعاقد الدولي (BDIMEXPORT LLC — المسجلة في Dun & Bradstreet برقم D-U-N-S®: 14-977-6743). تتم عمليات التقشير، والتجفيف الحراري، والخراطة، والتشريب داخل أسطوانات الأوتوكلاف، وتحميل الحاويات في ساحة مصنعنا مباشرة دون أي سماسرة أو عمولات وسطاء.",
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
    productName: "أعمدة الكهرباء والاتصالات الخشبية المشربة بالأوتوكلاف (7م – 12م)",
    sku: "BDIM-POLE-9M-12M",
    category: "Wooden Utility & Telecom Poles (HS 4403.11 / 4403.21)",
    image: OG_IMG,
    areaServed: ["LY", "JO", "IQ", "EG", "DZ", "TN", "SA", "AE"],
    crumbs: [
      { name: "الرئيسية", url: `${SITE_URL}/en/ar` },
      { name: "أعمدة الكهرباء والاتصالات الخشبية من المصنع", url: PAGE_URL },
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
          <Link
            id="cta-pole-ar-switch-en"
            href="/en/wooden-utility-poles"
            lang="en"
            hrefLang="en"
            className={up.langSwitchLink}
            data-clarity-event="pole_ar_switch_to_en"
          >
            <Globe aria-hidden="true" className={up.badgeIcon} />
            <span>English Version (Africa &amp; Global Export)</span>
          </Link>
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
            specs={[
              { val: "7m – 12m", label: "أطوال الشبكات الكهربائية والهاتفية" },
              { val: "140 / 40' HC", label: "حمولة الحاوية الواحدة لأعمدة 9 متر" },
              { val: "+90 539 414 78 54", label: "خط واتساب التصدير المباشر" },
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
            eyebrow="جدول المقاسات وحمولة الحاويات ونوع المعالجة"
            title="المواصفات الهندسية لأعمدة الكهرباء والاتصالات الخشبية (7م – 12م)"
            lead="ننتج الأعمدة الخشبية المخروطة والمقشرة وفق متطلبات شركات الكهرباء والاتصالات، مع مرونة كاملة في تجهيز دفعات متجانسة أو مختلطة حسب جدول كميات العطاء."
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={ps.metricCell}><bdi dir="ltr">7.0 m</bdi></td>
                <td><bdi dir="ltr">Ø 11 – 13 cm</bdi></td>
                <td><bdi dir="ltr">Ø 18 – 20 cm</bdi></td>
                <td>تشريب بني أو أخضر</td>
                <td><bdi dir="ltr">~180 – 195</bdi> عمود</td>
                <td>خطوط الهاتف، الألياف الضوئية، والتوزيع الفرعي</td>
              </tr>
              <tr>
                <td className={ps.metricCell}><bdi dir="ltr">8.0 m</bdi></td>
                <td><bdi dir="ltr">Ø 12 – 14 cm</bdi></td>
                <td><bdi dir="ltr">Ø 20 – 22 cm</bdi></td>
                <td>تشريب بني أو أخضر</td>
                <td><bdi dir="ltr">~155 – 170</bdi> عمود</td>
                <td>شبكات الجهد المنخفض وإنارة البلديات والقرى</td>
              </tr>
              <tr>
                <td className={ps.metricCell}><bdi dir="ltr">9.0 m</bdi> (قياسي للتصدير)</td>
                <td><bdi dir="ltr">Ø 12 – 14 cm</bdi></td>
                <td><bdi dir="ltr">Ø 22 – 23 cm</bdi></td>
                <td><strong>تشريب بني (الأكثر طلباً)</strong> أو أخضر</td>
                <td><strong><bdi dir="ltr">140</bdi> عمود (موثق)</strong></td>
                <td>المقاس الرئيسي لشبكات توزيع الكهرباء في ليبيا والأردن</td>
              </tr>
              <tr>
                <td className={ps.metricCell}><bdi dir="ltr">10.0 m – 11.0 m</bdi></td>
                <td><bdi dir="ltr">Ø 14 – 16 cm</bdi></td>
                <td><bdi dir="ltr">Ø 24 – 27 cm</bdi></td>
                <td>تشريب أخضر حصراً</td>
                <td><bdi dir="ltr">~95 – 110</bdi> عمود</td>
                <td>خطوط الجهد المتوسط ومعابر الطرق الرئيسية</td>
              </tr>
              <tr>
                <td className={ps.metricCell}><bdi dir="ltr">12.0 m</bdi></td>
                <td><bdi dir="ltr">Ø 15 – 17 cm</bdi></td>
                <td><bdi dir="ltr">Ø 26 – 30 cm</bdi></td>
                <td>تشريب أخضر حصراً</td>
                <td><bdi dir="ltr">~80 – 90</bdi> عمود (تستيف خاص)</td>
                <td>خطوط النقل الهوائية الثقيلة والمسافات الطويلة</td>
              </tr>
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

      <Section id="autoclave-protocol" tone="alt">
        <Reveal>
          <SectionHeader
            id="autoclave-protocol"
            eyebrow="بروتوكول المعالجة الصناعية بالضغط والتفريغ"
            title="معايير دفتر شروط التشريب بالأوتوكلاف لضمان عمر تشغيلي يتجاوز 40–50 عاماً"
            lead="على عكس المعالجة السطحية بالدهان أو الغمر البسيط، يخترق محلول التشريب في مصنعنا عمق الخشب العصاري تحت ضغط صناعي مرتفع لضمان عدم تآكل العمود في التربة الرطبة أو الصحراوية."
          />
        </Reveal>

        <div className={up.protocolGrid}>
          {AUTOCLAVE_STEPS_AR.map((st) => (
            <article key={st.num} className={up.protocolStep}>
              <span className={up.protocolNum}>{st.num}</span>
              <h3 className={up.protocolTitle}>{st.title}</h3>
              <p className={up.protocolVal}>{st.val}</p>
            </article>
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
            الكيان المصنّع والمصدّر في تركيا: <bdi dir="ltr">{CORPORATE_ENTITIES[0].name}</bdi> · ذراع التعاقد الدولي: <bdi dir="ltr">{CORPORATE_ENTITIES[1].name} (D-U-N-S® #{US_DUNS_NUMBER})</bdi> · واتساب رسمي: <bdi dir="ltr">{OFFICIAL_PHONE}</bdi>
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
