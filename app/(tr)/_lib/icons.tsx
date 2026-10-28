// TR sayfa ikonları — slug → lucide (SVG, AGENTS §5: ikon için AI görsel yok). Ana sayfa + indeks + ilgili kartlar aynı eşlemeyi kullanır.
import {
  Cog, Cpu, Factory, House, Landmark, Megaphone, Package, PackageSearch, Rocket, Shirt, Sofa, Store, Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SERVICE_ICON: Record<string, LucideIcon> = {
  tedarik: PackageSearch, "fabrika-denetimi": Factory, lojistik: Truck, gumruk: Landmark,
  "e-ihracat": Store, "b2b-pazarlama": Megaphone, "program-tanitim": Rocket,
};
export const GUIDE_ICON: Record<string, LucideIcon> = {
  tekstil: Shirt, elektronik: Cpu, "makine-parcalari": Cog, "ev-yasam": House, ambalaj: Package, mobilya: Sofa,
};
export const iconFor = (slug: string): LucideIcon => SERVICE_ICON[slug] ?? GUIDE_ICON[slug] ?? Package;
