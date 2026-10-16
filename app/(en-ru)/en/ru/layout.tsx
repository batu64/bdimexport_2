// /en/ru varyant layout — FAZ_2 Step 2.7: ortak VariantShell (dir/lang/CTA/switcher/footer lib/ui'da tek kaynak)
// hreflang VERİSİ bu dosyaya yazılmaz → manifest (Step 2.8 orchestrator enjeksiyonu)
import VariantShell from "@/lib/ui/VariantShell";

export default function RuVariantLayout({ children }: { children: React.ReactNode }) {
  return <VariantShell variant="ru">{children}</VariantShell>;
}
