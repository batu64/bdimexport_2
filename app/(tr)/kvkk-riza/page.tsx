// KVKK rıza metni görüntüleme sayfası (form'daki "Metni görüntüle" linkinin hedefi)
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni ve Açık Rıza — v1",
  description: "Bdimexport kişisel verilerin işlenmesi ve logo yayın rızası metni (v1).",
};

function renderSimple(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return md.split("\n").map(line => {
    const t = line.trim();
    if (!t) return "";
    if (t.startsWith("### ")) return `<h3>${esc(t.slice(4))}</h3>`;
    if (t.startsWith("## ")) return `<h2>${esc(t.slice(3))}</h2>`;
    if (t.startsWith("# ")) return `<h1>${esc(t.slice(2))}</h1>`;
    if (t.startsWith("- ")) return `<li>${esc(t.slice(2))}</li>`;
    return `<p>${esc(t)}</p>`;
  }).join("\n");
}

export default function KvkkPage() {
  const file = path.join(process.cwd(), "content", "tr", "legal", "kvkk-riza-v1.md");
  const md = fs.readFileSync(file, "utf-8");
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <div dangerouslySetInnerHTML={{ __html: renderSimple(md) }} />
    </main>
  );
}
