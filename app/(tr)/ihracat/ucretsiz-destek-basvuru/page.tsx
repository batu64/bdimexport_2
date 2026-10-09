// Başvuru formu sayfası — FAZ_1 Step 1.6 (şablon; insan review + KVKK v1 bekliyor)
// KVKK sürüm referansı: v0.1-draft sha 908031c6993e1c7b (onayda v1'e sabitlenir)
import type { Metadata } from "next";
import ApplicationForm from "@/app/components/ApplicationForm";

export const metadata: Metadata = {
  title: "Ücretsiz İhracat Hızlandırma Başvurusu",
  description: "Üreticiler için ücretsiz ihracat hızlandırma programı başvurusu — 48 saatte ön değerlendirme.",
};

export default function UcretsizDestekBasvuruPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Ücretsiz İhracat Hızlandırma Başvurusu</h1>
      <p>
        Başvurunuz 48 saat içinde ön değerlendirilir. KVKK açık rızası zorunludur;
        logo yayın rızası ayrı ve opsiyoneldir.
      </p>
      <ApplicationForm kvkkVersion="v0.1-draft (908031c6993e1c7b)" />
    </main>
  );
}
