// Minimal markdown renderer — varyant iskeleti (FAZ_2 Step 2.5, en-l10n-agent)
// Scope kilidi gereği varyant başına kopya; Step 2.7'de (fe-agent) ortak lib'e taşınır.
// RTL (opts.rtl): sayı/telefon token'ları <bdi dir="ltr"> ile sarılır — I18N_RULES §4.3

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(s: string, rtl: boolean): string {
  const bold = (t: string) => t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const bdi = (t: string) =>
    rtl ? t.replace(/(\+?\d[\d\s.,\-/()]*\d|\b\d+(?:[.,]\d+)*\b)/g, '<bdi dir="ltr">$1</bdi>') : t;
  // linkler korunur: URL içindeki rakamlar bdi'ye girmez
  return s
    .split(/(\[[^\]]+\]\([^)]+\))/g)
    .map((p) => {
      const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) return `<a href="${m[2]}">${bdi(bold(esc(m[1])))}</a>`;
      return bdi(bold(esc(p)));
    })
    .join("");
}

/** SSS bölüm başlıkları (tüm dil ailesi) — altındaki ### soruları <details> akordeona çevrilir (JS'siz). */
const FAQ_HEADINGS = new Set([
  "Frequently Asked Questions", "Sık Sorulan Sorular", "Häufig gestellte Fragen", "常见问题",
  "Часто задаваемые вопросы", "Questions fréquentes", "Foire aux questions", "Veelgestelde vragen", "Preguntas frecuentes", "الأسئلة الشائعة",
  "Usein kysytyt kysymykset", "Pyetjet e shpeshta", "Najczęściej zadawane pytania", "Întrebări frecvente", "Domande frequenti",
]);
/** h2 id: industries #calculation-notes çapalarıyla AYNI algoritma (latin); latin dışı başlık → bölüm-N */
const slugify = (s: string) =>
  s.toLowerCase().replace(/&amp;/g, "and").replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Render edilmiş html'den içindekiler (yalnız id'li h2) */
export function tocFromHtml(html: string): { id: string; text: string }[] {
  return [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
  }));
}

export function renderVariantMd(raw: string, opts: { rtl?: boolean } = {}) {
  const rtl = !!opts.rtl;
  const titleM = raw.match(/^# (.+)$/m);
  const metaM = raw.match(/<!-- META: title="([^"]+)" desc="([^"]+)" -->/);
  // Herkese açık çıktıya GİRMEZ: tüm HTML yorumları (META dahil), tüm H1 satırları (başlık h1 olarak ayrıca basılır) ve
  // üretim notu satırları (**Sayfa tipi:** / **Durum:**). Önceden yalnız META + ilk H1 siliniyor, geri kalanı sızıyordu (FAZ_2 2.7 smoke testi).
  const body = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((l) => !/^# /.test(l) && !/^\*\*(Sayfa tipi|Durum):\*\*/.test(l.trim()))
    .join("\n")
    .trim();
  let html = "", inUl = false, inOl = false, inTable = false, inFaq = false, inDetails = false;
  const used = new Set<string>();
  const closeDetails = () => { if (inDetails) { html += "</div></details>"; inDetails = false; } };
  const closeFaq = () => { closeDetails(); if (inFaq) { html += "</div>"; inFaq = false; } };
  const closeLists = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (t.startsWith("|")) {
      closeLists();
      const cells = t.split("|").slice(1, -1).map((c) => c.trim());
      if (/^[-\s|:]+$/.test(t)) continue;
      if (!inTable) { html += '<div class="table-wrap"><table><tr>' + cells.map((c) => `<th>${inline(c, rtl)}</th>`).join("") + "</tr>"; inTable = true; }
      else html += "<tr>" + cells.map((c) => `<td>${inline(c, rtl)}</td>`).join("") + "</tr>";
      continue;
    }
    if (inTable) { html += "</table></div>"; inTable = false; }
    if (t.startsWith("### ")) {
      closeLists();
      if (inFaq) { closeDetails(); html += `<details><summary>${inline(t.slice(4), rtl)}</summary><div>`; inDetails = true; }
      else html += `<h3>${inline(t.slice(4), rtl)}</h3>`;
    } else if (t.startsWith("## ")) {
      closeLists();
      closeFaq();
      const text = t.slice(3);
      let id = slugify(esc(text)) || `s-${used.size + 1}`;
      while (used.has(id)) id += "-2";
      used.add(id);
      html += `<h2 id="${id}">${inline(text, rtl)}</h2>`;
      if (FAQ_HEADINGS.has(text.trim())) { html += '<div class="faq">'; inFaq = true; }
    }
    else if (t.startsWith("- ")) { if (inOl) { html += "</ol>"; inOl = false; } if (!inUl) { html += "<ul>"; inUl = true; } html += `<li>${inline(t.slice(2), rtl)}</li>`; }
    else if (/^\d+\.\s/.test(t)) { if (inUl) { html += "</ul>"; inUl = false; } if (!inOl) { html += "<ol>"; inOl = true; } html += `<li>${inline(t.replace(/^\d+\.\s/, ""), rtl)}</li>`; }
    else if (t) { closeLists(); html += `<p>${inline(t, rtl)}</p>`; }
    else closeLists();
  }
  closeLists();
  if (inTable) html += "</table></div>";
  closeFaq();
  return { title: titleM?.[1] ?? "", metaTitle: metaM?.[1], desc: metaM?.[2], html };
}
