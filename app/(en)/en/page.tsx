import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "./_lib/services";
import { enAlternates } from "./_lib/hreflang";

// canonical + hreflang (en ailesi); başlık/açıklama (en) layout'tan
export const metadata: Metadata = { alternates: enAlternates("") };

export default function EnHomePage() {
  return (
    <main>
      <h1>Turkish Manufacturers, Verified. Global Buyers, Served.</h1>
      <p>Sourcing, factory inspection and logistics — get free quotation in 24h.</p>
      <p>
        <Link href="/en/services">Our Services</Link>
      </p>
      <ul>
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link href={`/en/services/${s.slug}`}>{s.label}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
