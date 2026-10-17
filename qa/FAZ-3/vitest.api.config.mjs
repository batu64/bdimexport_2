// QA vitest yapılandırması: kök = workers/api (zod/vitest çözümü için), test dosyası = qa/FAZ-3/api-qa.test.ts
// Çalıştır (repo kökünden): pnpm --dir workers/api exec vitest run --config ../../qa/FAZ-3/vitest.api.config.mjs
import { resolve } from "node:path";
const here = import.meta.dirname;
const config = {
  root: resolve(here, "../../workers/api"),
  test: { environment: "node", dir: here, include: ["api-qa.test.mts"], fileParallelism: false },
  server: { fs: { strict: false } },
};
export default config;
