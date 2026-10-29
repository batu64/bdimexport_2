// Tasarım QA (D9) — tarayıcı tabanlı UI denetimi (CDP, bağımlılık yok; Node 22 WebSocket).
//   node scripts/ui-audit.mjs <base-url> [rapor.json]      (CHROME_PATH = headless Chrome; varsayılan Remotion'ın headless shell'i)
// Kontroller: 4 kırılım (375/768/1440/1920) yatay taşma · tek H1 · lang/dir · koyu tema zemin/metin kontrastı · reduced-motion
// (gizli reveal yok, <video> yok) · klavye (ilk Tab = skip-link, odak halkası görünür) · ekran görüntüleri qa/TASARIM/screens/d9-*.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [base = "http://localhost:3100", out = "qa/TASARIM/ui-audit.json"] = process.argv.slice(2);
const ROOT = path.resolve(import.meta.dirname, "..");
const CHROME = process.env.CHROME_PATH ?? path.join(ROOT, "node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe");
const SHOTS = path.join(ROOT, "qa/TASARIM/screens");
const PAGES = ["/", "/en", "/de", "/zh", "/en/ar", "/ithalat/tedarik", "/en/products/olive-oil", "/ihracat/ucretsiz-destek-basvuru", "/de/vertrauen", "/en/ru"];
const WIDTHS = [375, 768, 1440, 1920];
const SHOT_PAGES = new Set(["/", "/en", "/de", "/zh", "/en/ar"]);

const port = 9333;
const proc = spawn(CHROME, [`--remote-debugging-port=${port}`, "--headless", "--no-first-run", "--hide-scrollbars", `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), "ui-"))}`, "about:blank"], { stdio: "ignore" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let ver;
for (let i = 0; i < 50 && !ver; i++) { await wait(200); ver = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json()).catch(() => null); }
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = new Set();
ws.addEventListener("message", (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else listeners.forEach((f) => f(d));
});
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, (d) => (d.error ? rej(new Error(`${method}: ${d.error.message}`)) : res(d.result)));
  ws.send(JSON.stringify({ id: i, method, params, sessionId }));
});
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
const cmd = (m, p) => send(m, p, S);
await cmd("Page.enable"); await cmd("Runtime.enable");
const evaluate = async (expr) => (await cmd("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const load = (url) => new Promise((res) => {
  const f = (d) => { if (d.sessionId === S && d.method === "Page.loadEventFired") { listeners.delete(f); res(); } };
  listeners.add(f);
  cmd("Page.navigate", { url });
});
async function open(url, width, { dark = false, reduce = false } = {}) {
  await cmd("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  await cmd("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }, { name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" }] });
  await load(url);
  await wait(1800); // hydration + giriş animasyonları
}
async function shot(name, width) {
  const h = await evaluate("Math.min(document.documentElement.scrollHeight, 9000)");
  await cmd("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 1, mobile: width < 768 });
  await evaluate("window.scrollTo(0, document.documentElement.scrollHeight); new Promise(r => setTimeout(r, 900))"); // reveal'ları tetikle
  await evaluate("window.scrollTo(0, 0); new Promise(r => setTimeout(r, 600))");
  const { data } = await cmd("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  fs.writeFileSync(path.join(SHOTS, `${name}.png`), Buffer.from(data, "base64"));
}

const LAYOUT = `(() => {
  const w = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
  const over = [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e);
    if (st.position === "fixed" || r.width === 0) return false; let p = e.parentElement; while (p) { const o = getComputedStyle(p).overflowX; if (o === "hidden" || o === "auto" || o === "clip" || o === "scroll") return false; p = p.parentElement; }
    return r.right > w + 1 || r.left < -1; }).slice(0, 5).map(e => e.tagName + "." + String(e.className).slice(0, 40));
  return { w, sw, overflow: sw > w + 1, over, h1: document.querySelectorAll("h1").length, lang: document.documentElement.lang, dir: document.documentElement.getAttribute("dir") };
})()`;

const rows = [];
for (const p of PAGES) {
  const r = { page: p, widths: {} };
  for (const w of WIDTHS) {
    await open(base + p, w);
    r.widths[w] = await evaluate(LAYOUT);
    if (SHOT_PAGES.has(p) && (w === 375 || w === 1440)) await shot(`d9-${p === "/" ? "tr" : p.slice(1).replace(/\//g, "-")}-${w}`, w);
  }
  // koyu tema: gövde zemini + metin rengi kontrastı
  await open(base + p, 1440, { dark: true });
  r.dark = await evaluate(`(() => { const lum = c => { const m = c.match(/\\d+(\\.\\d+)?/g).slice(0,3).map(Number).map(v => v/255).map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]; };
    const b = getComputedStyle(document.body); const L1 = lum(b.backgroundColor), L2 = lum(b.color); return { bg: b.backgroundColor, ink: b.color, contrast: +((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)).toFixed(2) }; })()`);
  if (SHOT_PAGES.has(p)) await shot(`d9-${p === "/" ? "tr" : p.slice(1).replace(/\//g, "-")}-1440-dark`, 1440);
  // reduced-motion
  await open(base + p, 1440, { reduce: true });
  await evaluate("window.scrollTo(0, document.documentElement.scrollHeight); new Promise(r => setTimeout(r, 400))");
  r.reducedMotion = await evaluate(`({ hiddenReveal: document.querySelectorAll('[data-reveal="hidden"]').length, videos: document.querySelectorAll("video").length,
    longAnimations: document.getAnimations().filter(a => (a.effect?.getTiming().duration ?? 0) > 1).length })`);
  // klavye: ilk Tab → skip-link, odak halkası
  await open(base + p, 1440);
  const tabs = [];
  for (let i = 0; i < 3; i++) {
    await cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    tabs.push(await evaluate(`(() => { const a = document.activeElement; const s = getComputedStyle(a); return { el: a.tagName + (a.className ? "." + String(a.className).split(" ")[0].slice(0, 24) : ""), text: (a.textContent || "").trim().slice(0, 24), outline: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2 }; })()`));
  }
  r.keyboard = tabs;
  rows.push(r);
  console.log(JSON.stringify({ page: p, overflow: Object.entries(r.widths).filter(([, v]) => v.overflow).map(([w, v]) => `${w}:${v.over.join(",")}`), h1: r.widths[1440].h1, dir: r.widths[1440].dir, dark: r.dark.contrast, rm: r.reducedMotion, firstTab: tabs[0] }));
}
fs.writeFileSync(out, JSON.stringify({ base, date: new Date().toISOString(), rows }, null, 2) + "\n");
ws.close();
proc.kill();
