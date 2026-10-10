import type { Metadata } from "next";
import styles from "../admin.module.css";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = { title: "Ayarlar", robots: { index: false, follow: false } };

// Erişim: Cloudflare Access + middleware.ts allowlist (3.1). Mutasyon yetkisi sunucuda (handler.ts) zorlanır.
export default function Page() {
  return (
    <>
      <h1 className={styles.h1}>Ayarlar</h1>
      <SettingsForm />
    </>
  );
}
