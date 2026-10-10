// FAZ_3 3.6 — /admin/content (erişim: Cloudflare Access + middleware.ts allowlist; 3.1)
import type { Metadata } from "next";
import ContentFactory from "./ContentFactory";

export const metadata: Metadata = {
  title: "AI İçerik Fabrikası",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return <ContentFactory mockMode />;
}
