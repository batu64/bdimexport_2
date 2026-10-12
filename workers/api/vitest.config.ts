import { defineConfig } from "vitest/config";

// fileParallelism:false — apply.test.ts 25/26MB buffer'lar ayırır; paralel worker'lar düşük RAM'li makinede/CI'da
// "memory allocation failed" ile aralıklı düşüyordu (1.8). Dosyalar sırayla koşar; toplam süre ~+3 sn.
export default defineConfig({ test: { environment: "node", include: ["test/**/*.test.ts"], fileParallelism: false } });
