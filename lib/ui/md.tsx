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
  let html = "", inUl = false, inOl = false, inTable = false;
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
      if (!inTable) { html += "<table><tr>" + cells.map((c) => `<th>${inline(c, rtl)}</th>`).join("") + "</tr>"; inTable = true; }
      else html += "<tr>" + cells.map((c) => `<td>${inline(c, rtl)}</td>`).join("") + "</tr>";
      continue;
    }
    if (inTable) { html += "</table>"; inTable = false; }
    if (t.startsWith("### ")) { closeLists(); html += `<h3>${inline(t.slice(4), rtl)}</h3>`; }
    else if (t.startsWith("## ")) { closeLists(); html += `<h2>${inline(t.slice(3), rtl)}</h2>`; }
    else if (t.startsWith("- ")) { if (inOl) { html += "</ol>"; inOl = false; } if (!inUl) { html += "<ul>"; inUl = true; } html += `<li>${inline(t.slice(2), rtl)}</li>`; }
    else if (/^\d+\.\s/.test(t)) { if (inUl) { html += "</ul>"; inUl = false; } if (!inOl) { html += "<ol>"; inOl = true; } html += `<li>${inline(t.replace(/^\d+\.\s/, ""), rtl)}</li>`; }
    else if (t) { closeLists(); html += `<p>${inline(t, rtl)}</p>`; }
    else closeLists();
  }
  closeLists();
  if (inTable) html += "</table>";
  return { title: titleM?.[1] ?? "", metaTitle: metaM?.[1], desc: metaM?.[2], html };
}
