"use client";
// lang-switcher — design/components/lang-switcher.md (dropdown 768+, statik liste 360)
// Liste dışarıdan gelir (switcherItems → olmayan karşılık listede yok); elle liste tutulmaz.
// Klavye: ↑↓ gezinme, Enter seçim (Link tıklaması), ESC kapat. Mevcut dil aria-selected + ✓.
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import styles from "./variant.module.css";
import { usePathname } from "next/navigation";
import type { SwitcherItem } from "./variants";

export default function LangSwitcher({
  itemsByPage,
  currentCode,
  label,
}: {
  /** Layout sayfalar arası kalıcıdır → aktif sayfa tipi pathname'den seçilir */
  itemsByPage: Record<"home" | "sourcing" | "inspection", SwitcherItem[]>;
  currentCode: string;
  label: string;
}) {
  const pathname = usePathname() ?? "";
  const pageKey = pathname.includes("/services/sourcing")
    ? "sourcing"
    : pathname.includes("/services/inspection")
    ? "inspection"
    : "home";
  const items = itemsByPage[pageKey];
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(0, items.findIndex((i) => i.code === currentCode)));
  const btnRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = items.find((i) => i.code === currentCode);
  const optId = (i: number) => `${uid}-opt-${i}`;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Odak seçeneğe taşınır → Enter doğal Link aktivasyonu (JS router navigation)
  useEffect(() => {
    if (open) document.getElementById(optId(active))?.focus();
  }); // bağımlılık dizisi bilerek yok: her render'da odak aktif seçeneğe taşınır

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a - 1 + items.length) % items.length);
    }
  };

  return (
    <div className={styles.swWrap}>
      <div className={styles.sw} ref={rootRef} onKeyDown={onKey}>
        <button
          ref={btnRef}
          type="button"
          className={styles.swBtn}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${uid}-list`}
          onClick={() => setOpen((o) => !o)}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
          </svg>
          <span>{current?.label ?? label}</span>
        </button>
        <ul
          id={`${uid}-list`}
          role="listbox"
          aria-label={label}
          aria-activedescendant={open ? optId(active) : undefined}
          className={`${styles.swList} ${open ? styles.open : ""}`}
        >
          {items.map((it, i) => (
            <li key={it.code} role="presentation">
              <Link
                id={optId(i)}
                role="option"
                href={it.href}
                lang={it.lang}
                hrefLang={it.hreflang}
                aria-selected={it.code === currentCode}
                className={i === active && open ? styles.active : undefined}
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
