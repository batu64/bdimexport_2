// ESLint 9 flat config — Next.js 15 (eslint-config-next 15.x eski eslintrc biçiminde → FlatCompat köprüsü).
// Non-interaktif: `pnpm lint` = `eslint .` (eski `next lint` yapılandırma yoksa interaktif soru soruyordu).
// `next build` da bu dosyayı bulursa lint adımını koşar; hata = build kırmızı.
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const require = createRequire(import.meta.url);

// pnpm katı node_modules: next config'in plugin'leri (react-hooks, @next/next, import…) kökten görünmez; yalnızca
// `pnpm run` NODE_PATH ekleyince çözülürdü → doğrudan `eslint`/editör/CI farklı davranırdı. Plugin'ler
// eslint-config-next'in kendi bağımlılıklarından çözülür (ortamdan bağımsız).
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  resolvePluginsRelativeTo: dirname(require.resolve("eslint-config-next/package.json")),
});

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      ".wrangler/**",
      "public/**",
      "workers/**", // ayrı paketler (kendi tsconfig/vitest); kapsam dışı
      "pocketbase/**", // PocketBase JSVM migration/hook dosyaları kapsam dışı
      "data-pool/**", // Bağımsız veri havuzu ve doğrulama scriptleri
      "**/*.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Türkçe metinde kesme işareti her yerde (Çin'den, İhracat'ın…); &apos; zorunluluğu salt gürültü.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
