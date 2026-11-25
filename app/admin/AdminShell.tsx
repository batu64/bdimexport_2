"use client";
// Menü + rol kapısı. Rol bilinmiyor/yüklenmedi/hata → viewer (yalnızca Dashboard). Gerçek yetki sunucuda (3.1 middleware / 3.4).
// Kural mantığı: _lib/nav.ts (test edilir). Rol kaynağı: GET /me → guard'ın AdminIdentity.role değeri (3.4'te servis edilir).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminGet, type Me } from "./_lib/api";
import { isActive, isBlocked, visibleNav } from "./_lib/nav";
import styles from "./admin.module.css";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/admin";
  const me = useAdminGet<Me>("/me");
  const role = me.state === "ready" ? me.data.role : undefined;
  const items = visibleNav(role);
  const blocked = isBlocked(path, role);
  const verifying = me.state === "loading";

  return (
    <>
      <aside className={styles.side}>
        <div className={styles.brand}>bdimexport Admin</div>
        <nav className={styles.nav} aria-label="Admin menü">
          {items.map((n) => (
            <Link key={n.href} href={n.href} className={`${styles.link} ${isActive(n.href, path) ? styles.active : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className={styles.muted}>{me.state === "ready" ? `${me.data.email} · ${me.data.role}` : verifying ? "Rol doğrulanıyor…" : "Rol doğrulanamadı · salt-okunur görünüm"}</p>
      </aside>
      <main className={styles.main}>
        {blocked ? <p className={verifying ? styles.muted : styles.err}>{verifying ? "Rol doğrulanıyor…" : "Bu modül için yetkiniz yok."}</p> : children}
      </main>
    </>
  );
}
