"use client";
// Menü + rol kapısı. Rol bilinmiyor/yüklenmedi/hata → viewer (yalnızca Dashboard). Gerçek yetki sunucuda (3.1 middleware / 3.4).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminGet, type Me } from "./_lib/api";
import styles from "./admin.module.css";

const NAV = [
  { href: "/admin", label: "Dashboard", adminOnly: false },
  { href: "/admin/leads", label: "Leads", adminOnly: true },
  { href: "/admin/partners", label: "Partners", adminOnly: true },
  { href: "/admin/content-factory", label: "İçerik Fabrikası", adminOnly: true },
  { href: "/admin/analytics", label: "Analitik", adminOnly: true },
  { href: "/admin/api", label: "API", adminOnly: true },
  { href: "/admin/settings", label: "Ayarlar", adminOnly: true },
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname().replace(/\/$/, "") || "/admin";
  const me = useAdminGet<Me>("/me");
  const isAdmin = me.state === "ready" && me.data.role === "admin";
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);
  const blocked = !isAdmin && NAV.some((n) => n.adminOnly && n.href === path);

  return (
    <>
      <aside className={styles.side}>
        <div className={styles.brand}>Bdimexport Admin</div>
        <nav className={styles.nav} aria-label="Admin menü">
          {items.map((n) => (
            <Link key={n.href} href={n.href} className={`${styles.link} ${path === n.href ? styles.active : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className={styles.muted}>{me.state === "ready" ? `${me.data.email} · ${me.data.role}` : "Rol doğrulanıyor…"}</p>
      </aside>
      <main className={styles.main}>
        {blocked ? <p className={styles.err}>Bu modül için yetkiniz yok.</p> : children}
      </main>
    </>
  );
}
