// TR route group layout — kök site, x-default: tr (SEO_PLAYBOOK §1.1). Boş iskelet; içerik FAZ 1.
import { IntlProvider } from "@/lib/intl";

export default function TrLayout({ children }: { children: React.ReactNode }) {
  return (
    <IntlProvider locale="tr">
      <div lang="tr">{children}</div>
    </IntlProvider>
  );
}
