// KVKK rıza metni görüntüleme sayfası (form'daki "Metni görüntüle" linkinin hedefi)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import PageHeader from "@/lib/ui/PageHeader";
import dict from "@/lib/messages/tr.json";
import { trAlternates } from "../_lib/content";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni ve Açık Rıza — v1",
  description: "Bdimexport kişisel verilerin işlenmesi ve logo yayın rızası metni (v1).",
  alternates: trAlternates("/kvkk-riza"),
};

function renderSimple(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // D4: metin aynen; yalnız işaretleme — belge "# " başlığı h2 (sayfa H1'i başlık bandında, tek H1 kuralı), ardışık "- " → <ul>
  let inList = false;
  const out: string[] = [];
  for (const line of md.split("\n")) {
    const t = line.trim();
    const isLi = t.startsWith("- ");
    if (!isLi && inList) { out.push("</ul>"); inList = false; }
    if (!t) continue;
    if (t.startsWith("### ")) out.push(`<h3>${esc(t.slice(4))}</h3>`);
    else if (t.startsWith("## ")) out.push(`<h2>${esc(t.slice(3))}</h2>`);
    else if (t.startsWith("# ")) out.push(`<h2>${esc(t.slice(2))}</h2>`);
    else if (isLi) { if (!inList) { out.push("<ul>"); inList = true; } out.push(`<li>${esc(t.slice(2))}</li>`); }
    else out.push(`<p>${esc(t)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

export default function KvkkPage() {
  const file = path.join(process.cwd(), "content", "tr", "legal", "kvkk-riza-v1.md");
  const md = fs.readFileSync(file, "utf-8");
  return (
    <main>
      <PageHeader
        crumbs={[{ label: dict.content.home, href: "/" }, { label: dict.legal.kvkkTitle }]}
        crumbsLabel={dict.page.crumbs}
        eyebrow={dict.legal.eyebrow}
        title={dict.legal.kvkkTitle}
      />
      {/* Hukuki metin AYNEN (v1, insan onaylı): yalnız okunur tipografi ile sarmalanır; metindeki H1 belge başlığı olarak kalır */}
      <div className="container section">
        <div className="prose legal" dangerouslySetInnerHTML={{ __html: renderSimple(md) }} />
      </div>
    </main>
  );
}
