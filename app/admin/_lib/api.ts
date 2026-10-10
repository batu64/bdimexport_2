"use client";
// Admin API istemcisi — yalnızca GET (dashboard salt okunur). Auth: Cloudflare Access cookie (same-origin).
import { useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "/api/admin";

export type Role = "admin" | "viewer";
export type Me = { email: string; role: Role };

export type DashboardSummary = {
  leads: { new: number; contacted: number; qualified: number; closed: number; last7d: number };
  contents: { draft: number; approved: number; published: number };
  partners: { pending: number; approved: number };
  analytics: { day: string; sessions: number | null; clicks: number | null; impressions: number | null } | null;
};

export type AnalyticsHistoryItem = {
  day: string;
  locale: string;
  ga4_json: string | null;
  gsc_json: string | null;
  meta_json: string | null;
};

export type AnalyticsHubData = {
  summary: {
    totalSessions: number;
    totalClicks: number;
    totalImpressions: number;
    totalSpend: number;
  };
  history: AnalyticsHistoryItem[];
  leadSources: Array<{ source: string; count: number; percentage: number }>;
  topPages: Array<{ page: string; sessions: number }>;
};

export type Remote<T> =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; data: T };

export function useAdminGet<T>(path: string): Remote<T> {
  const [res, setRes] = useState<Remote<T>>({ state: "loading" });
  useEffect(() => {
    const ctl = new AbortController();
    fetch(`${BASE}${path}`, { method: "GET", credentials: "same-origin", signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<T>;
      })
      .then((data) => setRes({ state: "ready", data }))
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        setRes({ state: "error", message: e instanceof Error ? e.message : "bilinmeyen hata" });
      });
    return () => ctl.abort();
  }, [path]);
  return res;
}
