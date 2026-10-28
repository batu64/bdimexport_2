// Inter (design-tokens §3, onaylı) — next/font build-time'da indirip self-host eder (static export uyumlu, harici istek yok).
// latin-ext: Türkçe (İ ı ş ğ) + Almanca. Değişken font → ağırlık listesi gerekmez; swap = metin font beklemeden görünür (LCP).
import { Inter } from "next/font/google";

export const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-inter" });
