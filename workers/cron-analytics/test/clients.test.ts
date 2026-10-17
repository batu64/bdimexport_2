import { describe, it, expect, vi } from "vitest";
import { fetchGscAnalytics, fetchGa4Analytics } from "../src/google";
import { fetchCfPagesAnalytics } from "../src/cloudflare";
import { fetchMetaAnalytics } from "../src/meta";
import type { Env } from "../src/types";

describe("analytics clients", () => {
  it("fetchGscAnalytics returns null when credentials missing", async () => {
    const env: Env = { DB: {} as any, GSC_SITE_URL: "https://bdimexport.com" };
    const res = await fetchGscAnalytics(env, "2026-10-09");
    expect(res).toBeNull();
  });

  it("fetchGa4Analytics returns null when property id or credentials missing", async () => {
    const env: Env = { DB: {} as any };
    const res = await fetchGa4Analytics(env, "2026-10-09");
    expect(res).toBeNull();
  });

  it("fetchCfPagesAnalytics returns null when CF api token missing", async () => {
    const env: Env = { DB: {} as any };
    const res = await fetchCfPagesAnalytics(env, "2026-10-09");
    expect(res).toBeNull();
  });

  it("fetchMetaAnalytics returns null when Meta credentials missing", async () => {
    const env: Env = { DB: {} as any };
    const res = await fetchMetaAnalytics(env, "2026-10-09");
    expect(res).toBeNull();
  });
});
