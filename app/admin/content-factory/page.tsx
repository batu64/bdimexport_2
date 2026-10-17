// FAZ_3 3.6 — /admin/content-factory (menü hedefi, _lib/nav.ts). Erişim: Cloudflare Access + guard (3.1), admin-only (3.2 + handler.ts).
// Bileşen ve sunucu mantığı app/admin/content/** altında (tek kaynak).
import type { Metadata } from "next";
import ContentFactory from "../content/ContentFactory";

export const metadata: Metadata = {
  title: "AI İçerik Fabrikası",
  robots: { index: false, follow: false },
};

export default function ContentFactoryPage() {
  return <ContentFactory />;
}
