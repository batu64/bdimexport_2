// Next.js config — Cloudflare Pages static export
// Not: Tüm sayfalar statik (SSG/Static). Form POST endpoint'i FAZ_3'te Workers'a taşınır
// (static export'ta API route'lar olmaz — Workers ayrı deploy edilir)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },  // static export'ta Image Optimization yok — R2/CDN devralır
  trailingSlash: false,
  // Yerel: dev sunucusu .next'i kullanırken paralel build için ayrı dizin (NEXT_DIST_DIR=.next-build; export HTML de oraya yazılır).
  // CI/Pages: tanımsız → .next + out/ (değişiklik yok)
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
