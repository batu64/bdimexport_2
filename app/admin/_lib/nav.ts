// Admin menü + rol kapısı (saf, test edilir). Güvenlik sınırı DEĞİL: gerçek yetki 3.1 guard'ı + 3.4 API'sindedir.
// Kural: yalnız rol === "admin" olan her şeyi görür; rol bilinmiyor/yüklenmedi/hata → viewer (yalnız Dashboard).
export type Role = "admin" | "viewer";

export const DASHBOARD_HREF = "/admin";

export const NAV = [
  { href: "/admin", label: "Dashboard", adminOnly: false },
  { href: "/admin/leads", label: "Leads", adminOnly: true },
  { href: "/admin/partners", label: "Partners", adminOnly: true },
  { href: "/admin/content-factory", label: "İçerik Fabrikası", adminOnly: true },
  { href: "/admin/analytics", label: "Analitik", adminOnly: true },
  { href: "/admin/api", label: "API", adminOnly: true },
  { href: "/admin/settings", label: "Ayarlar", adminOnly: true },
] as const;

/** Bilinmeyen/yanlış tipte rol → viewer (default-deny). */
export const effectiveRole = (role: unknown): Role => (role === "admin" ? "admin" : "viewer");

export const normalizePath = (p: string) => (p.replace(/\/+$/, "") || DASHBOARD_HREF);

export const visibleNav = (role: unknown) => NAV.filter((n) => !n.adminOnly || effectiveRole(role) === "admin");

/** Dashboard dışındaki HER yol (alt yollar ve menüde olmayanlar — örn. /admin/content — dahil) admin-only'dir. */
export const isBlocked = (path: string, role: unknown) =>
  effectiveRole(role) !== "admin" && normalizePath(path) !== DASHBOARD_HREF;

/** Menüde aktif öğe: tam eşleşme ya da alt yol. */
export const isActive = (href: string, path: string) => {
  const p = normalizePath(path);
  return href === DASHBOARD_HREF ? p === DASHBOARD_HREF : p === href || p.startsWith(href + "/");
};
