// TR içerik sayfaları — content/tr/**/*.md render (FAZ_1 Step 1.5 minimal)
// Hizmet sayfaları: /ithalat/[slug] · /ihracat/[slug] · rehberler: /ithalat/rehberler/[slug]
// NOT: full markdown parser yerine structured front-comment okuma; FAZ_2'de content collections'a taşınır
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

const CONTENT_ROOT = path.join(process.cwd(), "content", "tr");

function readMd(file: string) {
  const raw = fs.readFileSync(file, "utf-8");
  const titleM = raw.match(/^# (.+)$/m);
  const metaM = raw.match(/<!-- META: title="([^"]+)" desc="([^"]+)" -->/);
  const body = raw.replace(/^# .+$/m, "").replace(/<!-- META:[^>]+ -->/, "").trim();
  return { title: titleM?.[1] ?? "", metaTitle: metaM?.[1], desc: metaM?.[2], body };
}

// Basit markdown→HTML (pako yok; FAZ_2'de unified/remark ile değiştirilir)
function md2html(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  let html = "", inList = false, inTable = false, inCode = false;
  const inline = (s: string) => esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("```")) { inCode = !inCode; html += inCode ? "<pre><code>" : "</code></pre>"; continue; }
    if (inCode) { html += esc(line) + "\n"; continue; }
    if (t.startsWith("|")) {
      const cells = t.split("|").slice(1, -1).map(c => c.trim());
      if (/^[-\s|:]+$/.test(t)) continue;
      if (!inTable) { html += "<table>"; inTable = true; html += "<tr>" + cells.map(c => `<th>${inline(c)}</th>`).join("") + "</tr>"; }
      else html += "<tr>" + cells.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>";
      continue;
    }
    if (inTable) { html += "</table>"; inTable = false; }
    if (t.startsWith("### ")) { html += `<h3>${inline(t.slice(4))}</h3>`; }
    else if (t.startsWith("## ")) { html += `<h2>${inline(t.slice(3))}</h2>`; }
    else if (t.startsWith("- ")) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(t.slice(2))}</li>`; }
    else if (t.match(/^\d+\. /)) { if (!inList) { html += "<ol>"; inList = true; } html += `<li>${inline(t.replace(/^\d+\. /, ""))}</li>`; }
    else { if (inList) { html += inList ? "</ul>" : ""; inList = false; }
      if (t) html += `<p>${inline(t)}</p>`; }
  }
  if (inList) html += "</ul>";
  if (inTable) html += "</table>";
  if (inCode) html += "</code></pre>";
  return html;
}

function listMd(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));
}

export function generateStaticParams() {
  const services = [...listMd(path.join(CONTENT_ROOT, "ithalat")).filter(s => s !== "danismanlik-talebi"),
                    ...listMd(path.join(CONTENT_ROOT, "ihracat"))];
  const guides = listMd(path.join(CONTENT_ROOT, "ithalat", "rehberler"));
  return [
    ...services.map(s => ({ slug: s, cat: "services" })),
    ...guides.map(g => ({ slug: g, cat: "guides" })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidates = [path.join(CONTENT_ROOT, "ithalat", "rehberler", slug + ".md")];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return {};
  const { metaTitle, desc } = readMd(file);
  return { title: metaTitle ?? slug, description: desc };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidates = [path.join(CONTENT_ROOT, "ithalat", "rehberler", slug + ".md")];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return <main><h1>Bulunamadı</h1></main>;
  const { title, body } = readMd(file);
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: md2html(body) }} />
      <p style={{ marginTop: "2rem" }}>
        <a href="/ithalat/danismanlik-talebi">Ücretsiz Ön Değerlendirme Talebi</a>
      </p>
    </main>
  );
}
