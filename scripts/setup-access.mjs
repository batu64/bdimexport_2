#!/usr/bin/env node
// FAZ_3 3.1 (ops) — Cloudflare Access app + policy'leri Cloudflare API ile İDEMPOTENT kurar/hizalar.
//
//   node scripts/setup-access.mjs            → DRY-RUN: ne değişeceğini yazar, hiçbir şey yazmaz (varsayılan)
//   node scripts/setup-access.mjs --apply    → farkları uygular
//
// Env (değerler ASLA koda/log'a yazılmaz; .env.example'da yalnız adlar):
//   CLOUDFLARE_API_TOKEN   zorunlu — izin: Account › Access: Apps and Policies › Edit
//                          (+ Access: Organizations, Identity Providers, and Groups › Read)
//   CLOUDFLARE_ACCOUNT_ID  zorunlu
//   ADMIN_EMAILS           zorunlu — virgülle; allow policy'nin Include listesi (guard allowlist'iyle AYNI olmalı)
//   ACCESS_APP_DOMAINS     ops. — virgülle; varsayılan bdimexport.pages.dev/admin,bdimexport.pages.dev/admin/*
//   ACCESS_AUD             ops. — verilirse mevcut app'in AUD'u ile karşılaştırılır (wrangler.toml senkron kontrolü)
//
// Güvenlik kuralları:
//   - Var olan app ASLA silinmez/yeniden yaratılmaz (yeniden yaratma = yeni AUD = guard 403). Yalnız PUT ile hizalanır.
//   - Uygulama yoksa --apply ile oluşturulur ve yeni AUD yazdırılır → wrangler.toml [vars] ACCESS_AUD güncellenmeli.
//   - Token yalnız Authorization başlığında kullanılır; hata çıktısında yalnız Cloudflare hata kodu/mesajı basılır.
//   - E-postalar log'da maskelenir (b***@gmail.com).

import { pathToFileURL } from "node:url";

const API = "https://api.cloudflare.com/client/v4";
const APP_NAME = "bdimexport-admin";
const DEFAULT_DOMAINS = ["bdimexport.pages.dev/admin", "bdimexport.pages.dev/admin/*"];

export function maskEmail(e) {
  const [u, d] = String(e).split("@");
  return d ? `${u.slice(0, 1)}***@${d}` : "***";
}

function list(s) {
  return (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
}

/** Desired state — docs/access-setup.md §4–§6 ile birebir. */
export function desiredApp(domains, idpId) {
  return {
    name: APP_NAME,
    type: "self_hosted",
    domain: domains[0],
    destinations: domains.map((uri) => ({ type: "public", uri })),
    session_duration: "8h",
    allowed_idps: [idpId],
    auto_redirect_to_identity: true,
    app_launcher_visible: false,
    http_only_cookie_attribute: true,
    same_site_cookie_attribute: "lax",
    enable_binding_cookie: true,
    service_auth_401_redirect: false,
  };
}

export function desiredPolicies(emails, idpId) {
  return [
    {
      name: "allow-admins",
      decision: "allow",
      precedence: 1,
      session_duration: "8h",
      include: emails.map((email) => ({ email: { email } })),
      require: [{ login_method: { id: idpId } }],
    },
    { name: "deny-everyone-else", decision: "deny", precedence: 2, include: [{ everyone: {} }] },
  ];
}

/** Karşılaştırma: yalnız desired'da tanımlı alanlar; diziler sırası korunarak. */
export function diffFields(current, desired) {
  const norm = (v) => JSON.stringify(v ?? null);
  return Object.keys(desired).filter((k) => norm(current?.[k]) !== norm(desired[k]));
}

function client(fetchImpl, token, accountId) {
  return async function cf(method, path, body) {
    const res = await fetchImpl(`${API}/accounts/${accountId}${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    if (!res.ok || !json?.success) {
      const errs = (json?.errors ?? []).map((e) => `${e.code}: ${e.message}`).join("; ") || `HTTP ${res.status}`;
      throw new Error(`Cloudflare API ${method} ${path.replace(/[0-9a-f]{32}/gi, "<id>")} → ${errs}`);
    }
    return json.result;
  };
}

export async function main({ env = process.env, argv = process.argv.slice(2), fetchImpl = fetch, log = console.log } = {}) {
  const apply = argv.includes("--apply");
  const token = env.CLOUDFLARE_API_TOKEN;
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const emails = list(env.ADMIN_EMAILS).map((e) => e.toLowerCase());
  const domains = list(env.ACCESS_APP_DOMAINS).length ? list(env.ACCESS_APP_DOMAINS) : DEFAULT_DOMAINS;

  const missing = [!token && "CLOUDFLARE_API_TOKEN", !accountId && "CLOUDFLARE_ACCOUNT_ID", !emails.length && "ADMIN_EMAILS"].filter(Boolean);
  if (missing.length) throw new Error(`eksik env: ${missing.join(", ")}`);
  if (emails.some((e) => !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(e))) throw new Error("ADMIN_EMAILS geçersiz e-posta içeriyor");

  const cf = client(fetchImpl, token, accountId);
  log(`mod: ${apply ? "APPLY (yazar)" : "DRY-RUN (yazmaz)"} · app: ${APP_NAME} · domain: ${domains.join(", ")} · admin: ${emails.map(maskEmail).join(", ")}`);

  // 1) Google IdP
  const idps = await cf("GET", "/access/identity_providers");
  const google = (idps ?? []).filter((p) => p.type === "google" || p.type === "google-apps");
  if (google.length !== 1) throw new Error(`tam 1 Google login method beklenir, bulunan: ${google.length} (docs/access-setup.md §3.2)`);
  const idpId = google[0].id;

  // 2) App
  const apps = await cf("GET", "/access/apps");
  const matches = (apps ?? []).filter((a) => a.name === APP_NAME);
  if (matches.length > 1) throw new Error(`aynı adla ${matches.length} app var — panelden elle tekilleştir, script silmez`);
  const want = desiredApp(domains, idpId);
  let app = matches[0];
  const actions = [];

  if (!app) {
    actions.push(`app OLUŞTUR (${APP_NAME}) — YENİ AUD üretilecek → wrangler.toml ACCESS_AUD güncellenmeli`);
    if (apply) app = await cf("POST", "/access/apps", want);
  } else {
    const d = diffFields(app, want);
    if (d.length) {
      actions.push(`app GÜNCELLE: ${d.join(", ")}`);
      if (apply) app = await cf("PUT", `/access/apps/${app.id}`, { ...want });
    }
  }

  // 3) Policy'ler (app'e bağlı; isimle eşleşir)
  if (app?.id) {
    const current = (await cf("GET", `/access/apps/${app.id}/policies`)) ?? [];
    for (const p of desiredPolicies(emails, idpId)) {
      const cur = current.find((c) => c.name === p.name);
      if (!cur) {
        actions.push(`policy OLUŞTUR: ${p.name}`);
        if (apply) await cf("POST", `/access/apps/${app.id}/policies`, p);
      } else {
        const d = diffFields(cur, p);
        if (d.length) {
          actions.push(`policy GÜNCELLE: ${p.name} (${d.join(", ")})`);
          if (apply) await cf("PUT", `/access/apps/${app.id}/policies/${cur.id}`, p);
        }
      }
    }
    const extra = current.filter((c) => !["allow-admins", "deny-everyone-else"].includes(c.name));
    if (extra.length) actions.push(`UYARI: beklenmeyen policy (silinmedi, elle incele): ${extra.map((c) => c.name).join(", ")}`);
  } else if (!apply) {
    actions.push("policy OLUŞTUR: allow-admins, deny-everyone-else (app oluşturulunca)");
  }

  log(actions.length ? actions.map((a) => `  - ${a}`).join("\n") : "  ✓ değişiklik yok — panel desired state ile aynı");

  if (app?.aud) {
    log(`AUD: ${app.aud}`);
    if (env.ACCESS_AUD && env.ACCESS_AUD !== app.aud) {
      log("UYARI: ACCESS_AUD (env/wrangler.toml) ≠ app AUD → guard tüm istekleri 403'ler; wrangler.toml [vars] ACCESS_AUD'u güncelle");
      return { actions, aud: app.aud, audMismatch: true };
    }
  }
  if (!apply && actions.length) log("Uygulamak için: node scripts/setup-access.mjs --apply");
  return { actions, aud: app?.aud ?? null, audMismatch: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(
    (r) => process.exit(r.audMismatch ? 2 : 0),
    (e) => {
      console.error(`HATA: ${e.message}`);
      process.exit(1);
    },
  );
}
