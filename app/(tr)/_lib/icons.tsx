// TR sayfa ikonları — slug → lucide (SVG, AGENTS §5: ikon için AI görsel yok). Ana sayfa + indeks + ilgili kartlar aynı eşlemeyi kullanır.
import {
  BarChart3, ClipboardCheck, Cog, Cpu, Factory, Globe2, House, Landmark, Megaphone, Package, PackageSearch, Rocket, ShieldCheck, Shirt, Sofa, Store, Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SERVICE_ICON: Record<string, LucideIcon> = {
  tedarik: PackageSearch,
  "fabrika-denetimi": Factory,
  "konteyner-yukleme-denetimi": ClipboardCheck,
  "ticari-istihbarat-uretici-dogrulama": ShieldCheck,
  lojistik: Truck,
  gumruk: Landmark,
  "e-ihracat": Store,
  "b2b-pazarlama": Megaphone,
  "pazar-arastirmasi-musteri-bulma": BarChart3,
  "kuresel-pazarlama-sistemi-kurulumu": Globe2,
  "program-tanitim": Rocket,
};
export const GUIDE_ICON: Record<string, LucideIcon> = {
  tekstil: Shirt, elektronik: Cpu, "makine-parcalari": Cog, "ev-yasam": House, ambalaj: Package, mobilya: Sofa,
};
export const iconFor = (slug: string): LucideIcon => SERVICE_ICON[slug] ?? GUIDE_ICON[slug] ?? Package;
