// FAZ_3 3.6 — ContentApi'nin HTTP istemcisi (tarayıcı → /admin/api/content/*; Access cookie same-origin).
// Sunucu tarafı: handler.ts. Mock (mock.ts) yalnız NEXT_PUBLIC_CONTENT_MOCK="1" iken kullanılır.
import { ApiError, type ContentApi, type ContentStatus } from "./types.ts";

const BASE = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "/admin/api"}/content`;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    credentials: "same-origin",
    ...init,
    headers: init.body ? { "content-type": "application/json", ...(init.headers ?? {}) } : init.headers,
  });
  const body = (await r.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!r.ok) throw new ApiError(r.status, body?.error ?? `http_${r.status}`);
  return body as T;
}
const post = <T>(path: string, body: object, method = "POST") => call<T>(path, { method, body: JSON.stringify(body) });

export function createHttpContentApi(): ContentApi {
  return {
    listNews: () => call("/news"),
    listJobs: () => call("/jobs"),
    listDrafts: (status: ContentStatus = "draft") => call(`/drafts?status=${status}`),
    listAudit: () => call("/audit"),
    submitJob: (input) => post("/jobs", input),
    updateDraft: async (id, patch) => { await post(`/drafts/${encodeURIComponent(id)}`, patch, "PATCH"); },
    approve: (ids) => post("/drafts/approve", { ids }),
    publish: (ids) => post("/drafts/publish", { ids }),
    reject: (ids, reason) => post("/drafts/reject", { ids, reason }),
    mockProduce: (jobId) => post(`/jobs/${encodeURIComponent(jobId)}/mock-produce`, {}),
  };
}
