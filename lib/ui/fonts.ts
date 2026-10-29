// Inter (design-tokens §3, onaylı) — next/font build-time'da indirip self-host eder (static export uyumlu, harici istek yok).
// latin-ext: Türkçe (İ ı ş ğ) + Almanca. Değişken font → ağırlık listesi gerekmez; swap = metin font beklemeden görünür (LCP).
import { Inter, Noto_Sans_Arabic } from "next/font/google";

// D9 perf: preload kapalı — swap ile metin fallback fontla hemen çizilir (FCP/LCP); boyut uyumlu fallback next/font ayarlar (CLS ≈ 0).
export const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap", preload: false, variable: "--font-inter" });

// /en/ar (design-tokens §2.3): değişken sınıfı yalnız ar kökünde verilir → diğer sayfalarda indirilmez; ön yükleme kapalı (LCP etkilenmez).
export const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], display: "swap", preload: false, variable: "--font-noto-arabic" });
