// FAZ_4 4.9 QA vitest yapılandırması: kök = workers/cron-rss (vitest + node türleri), testler = qa/FAZ-4/*.test.mts.
// Çalıştır (repo kökünden): pnpm --dir workers/cron-rss exec vitest run --config ../../qa/FAZ-4/vitest.config.mjs
import { resolve } from "node:path";
const here = import.meta.dirname;
export default {
  root: resolve(here, "../../workers/cron-rss"),
  test: { environment: "node", dir: here, include: ["*.test.mts"], fileParallelism: false },
  server: { fs: { strict: false } },
};
