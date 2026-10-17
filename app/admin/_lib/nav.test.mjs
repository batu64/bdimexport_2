// FAZ_3 3.2 — rol kapısı. Çalıştır: node --experimental-strip-types --test app/admin/_lib/nav.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { NAV, visibleNav, isBlocked, isActive, effectiveRole } from "./nav.ts";

const labels = (r) => visibleNav(r).map((n) => n.label);

test("menü 7 öğe: Dashboard/Leads/Partners/İçerik Fabrikası/Analitik/API/Ayarlar", () => {
  assert.deepEqual(NAV.map((n) => n.label), ["Dashboard", "Leads", "Partners", "İçerik Fabrikası", "Analitik", "API", "Ayarlar"]);
});

test("viewer yalnız Dashboard görür", () => assert.deepEqual(labels("viewer"), ["Dashboard"]));
test("admin hepsini görür", () => assert.equal(labels("admin").length, 7));
test("rol yok/bozuk/yüklenmedi → viewer (default-deny)", () => {
  for (const r of [undefined, null, "", "ADMIN", "root", 1, {}]) {
    assert.equal(effectiveRole(r), "viewer");
    assert.deepEqual(labels(r), ["Dashboard"]);
  }
});

test("viewer: Dashboard açık; menüdeki, alt yoldaki ve menüde olmayan tüm yollar kapalı", () => {
  assert.equal(isBlocked("/admin", "viewer"), false);
  assert.equal(isBlocked("/admin/", "viewer"), false);
  for (const p of ["/admin/leads", "/admin/leads/", "/admin/leads/42", "/admin/partners", "/admin/content", "/admin/content-factory",
    "/admin/analytics", "/admin/api", "/admin/settings", "/admin/e2e", "/admin/yok"]) {
    assert.equal(isBlocked(p, "viewer"), true, p);
    assert.equal(isBlocked(p, undefined), true, p);
  }
});

test("admin hiçbir yolda engellenmez", () => {
  for (const p of ["/admin", "/admin/leads", "/admin/content", "/admin/settings"]) assert.equal(isBlocked(p, "admin"), false);
});

test("aktif öğe: Dashboard yalnız /admin'de; diğerleri alt yolda da", () => {
  assert.equal(isActive("/admin", "/admin/"), true);
  assert.equal(isActive("/admin", "/admin/leads"), false);
  assert.equal(isActive("/admin/leads", "/admin/leads/42"), true);
  assert.equal(isActive("/admin/api", "/admin/apix"), false);
});
