// /en/fi variant shell layout
import VariantShell from "@/lib/ui/VariantShell";

export default function FiVariantLayout({ children }: { children: React.ReactNode }) {
  return <VariantShell variant="fi">{children}</VariantShell>;
}
