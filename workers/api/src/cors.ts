import type { Env } from "./types";

export function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

/** Origin başlığı yoksa (server-to-server/curl) true; varsa beyaz listede olmalı. */
export function originAllowed(env: Env, origin: string | null): boolean {
  if (!origin) return true;
  return allowedOrigins(env).includes(origin);
}

export function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  if (!origin || !originAllowed(env, origin)) return { vary: "Origin" };
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-api-key",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}
