// /en/ro variant shell layout
import VariantShell from "@/lib/ui/VariantShell";

export default function RoVariantLayout({ children }: { children: React.ReactNode }) {
  return <VariantShell variant="ro">{children}</VariantShell>;
}
