// FAZ_3 3.6 e2e — çalıştır: node --experimental-strip-types --test app/admin/content/e2e/content.test.mjs
// Gerçek migration'lar (0001+0002) node:sqlite üzerinde uygulanır; service.ts bu DB'ye karşı koşar.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createContentService, seedMockDraftForJob } from "../service.ts";
import { createMockContentApi } from "../mock.ts";
import { ApiError } from "../types.ts";

const NOW = Date.parse("2026-10-10T12:00:00Z");
const ACTOR = "boss@example.com";

// node:sqlite → D1 benzeri yüzey (prepare/bind/all/first + batch atomik)
function d1(sqlite) {
  const mk = (sql, binds = []) => ({
    sql,
    binds,
    bind: (...b) => mk(sql, b),
    all: async () => ({ results: sqlite.prepare(sql).all(...binds) }),
    first: async () => sqlite.prepare(sql).get(...binds) ?? null,
    run: () => sqlite.prepare(sql).run(...binds),
  });
  return {
    prepare: (sql) => mk(sql),
    batch: async (stmts) => {
      sqlite.exec("BEGIN");
      try {
        for (const s of stmts) s.run();
        sqlite.exec("COMMIT");
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
      return [];
    },
  };
}

function fresh() {
  const sqlite = new DatabaseSync(":memory:");
  for (const f of ["0001_init.sql", "0002_admin_audit_integrity.sql"]) sqlite.exec(readFileSync(new URL(`../../../../db/migrations/${f}`, import.meta.url), "utf8"));
  const db = d1(sqlite);
  return { sqlite, db, svc: createContentService(db, ACTOR, () => NOW) };
}
const iso = (h) => new Date(NOW + h * 3_600_000).toISOString().slice(0, 19).replace("T", " ");
const audits = (sqlite, action) => sqlite.prepare("SELECT * FROM admin_actions WHERE action=?").all(action);

test("Input C: keyword → ai_jobs(pending) + keywords + audit; draft → onay → yayın (ayrı adımlar)", async () => {
  const { sqlite, db, svc } = fresh();
  const { job_id, keyword_id } = await svc.submitJob({ input: "C", phrase: "zeytinyağı ihracatı nasıl yapılır", intent: "informational", volume: 500, locales: ["tr", "en-ru"] });
  const job = sqlite.prepare("SELECT * FROM ai_jobs WHERE id=?").get(job_id);
  assert.equal(job.status, "pending");
  assert.equal(job.model, null); // model seçimi Faz 4
  assert.deepEqual(JSON.parse(job.payload_json).locales, ["tr", "en-ru"]);
  const kw = sqlite.prepare("SELECT * FROM keywords WHERE id=?").get(keyword_id);
  assert.equal(kw.volume_estimated, 1); // elle girilen volume tahmin olarak işaretli
  assert.equal(audits(sqlite, "create_ai_job").length, 1);

  // (mock üretim)
  const ids = await seedMockDraftForJob(db, job_id, { ...JSON.parse(job.payload_json) });
  assert.equal(sqlite.prepare("SELECT status FROM ai_jobs WHERE id=?").get(job_id).status, "done");
  const drafts = await svc.listDrafts("draft");
  assert.equal(drafts.length, 2);

  // yayın, onaysız ilerlemez
  let r = await svc.publish(ids);
  assert.deepEqual(r.changed, []);
  assert.equal(r.skipped[0].reason, "status_is_draft");

  // toplu onay → approved (published DEĞİL)
  r = await svc.approve(ids);
  assert.equal(r.changed.length, 2);
  assert.equal((await svc.listDrafts("approved")).length, 2);
  assert.equal((await svc.listDrafts("published")).length, 0);
  assert.equal(audits(sqlite, "approve_content").length, 2);

  // çift onay → atlanır
  r = await svc.approve([ids[0]]);
  assert.equal(r.skipped[0].reason, "status_is_approved");

  // ayrı yayın aksiyonu
  r = await svc.publish([ids[0]]);
  assert.equal(r.changed.length, 1);
  const pub = sqlite.prepare("SELECT status, published_at FROM contents WHERE id=?").get(ids[0]);
  assert.equal(pub.status, "published");
  assert.ok(pub.published_at);
  assert.equal(audits(sqlite, "publish_content").length, 1);
});

test("reject: gerekçe zorunlu, yalnız draft; audit old_value'da eski satır kalır", async () => {
  const { sqlite, db, svc } = fresh();
  const { job_id } = await svc.submitJob({ input: "A", text: "ham metin", locales: ["tr"] });
  const [id] = await seedMockDraftForJob(db, job_id, { locales: ["tr"], text: "ham metin" });
  await assert.rejects(() => svc.reject([id], " "), (e) => e instanceof ApiError && e.code === "reason_required");
  const r = await svc.reject([id], "kalitesiz");
  assert.equal(r.changed.length, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM contents").get().n, 0);
  const a = audits(sqlite, "reject_content")[0];
  assert.equal(JSON.parse(a.old_value).title.startsWith("[MOCK]"), true);
  assert.equal(JSON.parse(a.new_value).reason, "kalitesiz");
});

test("updateDraft: yalnız draft düzenlenir; audit düşer", async () => {
  const { sqlite, db, svc } = fresh();
  const { job_id } = await svc.submitJob({ input: "A", text: "x", locales: ["tr"] });
  const [id] = await seedMockDraftForJob(db, job_id, { locales: ["tr"], text: "x" });
  await svc.updateDraft(id, { title: "Yeni başlık" });
  assert.equal(sqlite.prepare("SELECT title FROM contents WHERE id=?").get(id).title, "Yeni başlık");
  assert.equal(audits(sqlite, "update_content").length, 1);
  await svc.approve([id]);
  await assert.rejects(() => svc.updateDraft(id, { title: "z" }), (e) => e.code === "only_draft_editable");
});

test("audit atomikliği: mutasyon sonrası audit düşerse mutasyon da geri alınır", async () => {
  const { sqlite, db } = fresh();
  const svc = createContentService(db, ACTOR, () => NOW);
  const { job_id } = await svc.submitJob({ input: "A", text: "x", locales: ["tr"] });
  const [id] = await seedMockDraftForJob(db, job_id, { locales: ["tr"], text: "x" });
  sqlite.exec("CREATE TRIGGER t_fail BEFORE INSERT ON admin_actions WHEN NEW.action='approve_content' BEGIN SELECT RAISE(ABORT,'boom'); END;");
  await assert.rejects(() => svc.approve([id]));
  assert.equal(sqlite.prepare("SELECT status FROM contents WHERE id=?").get(id).status, "draft");
});

test("doğrulamalar: bad locale / boş metin / var olmayan haber / audit append-only", async () => {
  const { sqlite, svc } = fresh();
  await assert.rejects(() => svc.submitJob({ input: "A", text: "x", locales: ["xx"] }), (e) => e.code === "bad_locale");
  await assert.rejects(() => svc.submitJob({ input: "A", text: "  ", locales: ["tr"] }), (e) => e.code === "bad_text");
  await assert.rejects(() => svc.submitJob({ input: "B", news_ids: ["yok"], locales: ["tr"] }), (e) => e.code === "news_not_found");
  await assert.rejects(() => svc.submitJob({ input: "A", text: "x", locales: [] }), (e) => e.code === "locale_required");
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM ai_jobs").get().n, 0); // reddedilen istek kuyruğa düşmez
  await svc.submitJob({ input: "A", text: "x", locales: ["tr"] });
  assert.throws(() => sqlite.exec("DELETE FROM admin_actions"), /append-only/);
  await assert.rejects(() => svc.mockProduce("x"), (e) => e.code === "mock_disabled");
});

test("Input B + TTL: kalan saat doğru, <24s uyarılı, süresi dolan listelenmez", async () => {
  const { sqlite, svc } = fresh();
  const ins = sqlite.prepare("INSERT INTO rss_news (id, source, title, url, expires_at, tags_json) VALUES (?,?,?,?,?,?)");
  ins.run("n1", "TİM", "kısa", "https://a", iso(10.5), '{"sector":"gıda"}');
  ins.run("n2", "TİM", "uzun", "https://b", iso(50), null);
  ins.run("n3", "TİM", "bitmiş", "https://c", iso(-1), null);
  const news = await svc.listNews();
  assert.deepEqual(news.map((n) => n.id), ["n1", "n2"]);
  assert.equal(news[0].hours_left, 10);
  assert.equal(news[0].ttl_warning, true);
  assert.equal(news[1].ttl_warning, false);
  assert.equal(news[0].tags.sector, "gıda");
  const { job_id } = await svc.submitJob({ input: "B", news_ids: ["n1", "n2"], locales: ["de"] });
  assert.ok(job_id);
});

test("Mock API (UI backend): keyword → job → mock üretim → draft → onay → yayın + her adım audit'te", async () => {
  const api = createMockContentApi("mock@local", () => NOW);
  const news = await api.listNews();
  assert.equal(news.find((n) => n.id === "n1").ttl_warning, true); // 12s
  assert.equal(news.find((n) => n.id === "n2").ttl_warning, false); // 52s
  const before = (await api.listDrafts()).length;
  const { job_id } = await api.submitJob({ input: "C", phrase: "çin tedarikçi bulma", locales: ["tr", "zh"] });
  assert.equal((await api.listJobs())[0].status, "pending");
  const { content_ids } = await api.mockProduce(job_id);
  assert.equal((await api.listDrafts()).length, before + 2);
  await assert.rejects(() => api.mockProduce(job_id), (e) => e.code === "job_not_pending");
  assert.equal((await api.publish(content_ids)).changed.length, 0); // onaysız yayın yok
  assert.equal((await api.approve(content_ids)).changed.length, 2);
  assert.equal((await api.publish(content_ids)).changed.length, 2);
  assert.equal((await api.listDrafts("published")).length, 2);
  const actions = (await api.listAudit()).map((a) => a.action);
  for (const a of ["create_ai_job", "create_keyword", "mock_produce", "approve_content", "publish_content"]) assert.ok(actions.includes(a), a);
});
