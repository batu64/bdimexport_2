// İlk admin-internal key bootstrap'i. Ham key stderr'e (tek seferlik), SQL (yalnız hash) stdout'a yazılır.
// Kullanım: node scripts/new-key.mjs "ilk-admin" admin-internal
import { randomBytes, createHash } from "node:crypto";

const [name = "bootstrap", tier = "admin-internal"] = process.argv.slice(2);
if (!["read-only", "partner", "admin-internal"].includes(tier)) {
  console.error("tier geçersiz");
  process.exit(1);
}
const key = "bdx_" + randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(key).digest("hex");
const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const id = [...randomBytes(26)].map((b) => crockford[b % 32]).join("");
console.error("KEY (tek seferlik, saklayın): " + key);
console.log(
  "INSERT INTO api_keys (id,name,key_hash,tier) VALUES ('" + id + "','" + name.replace(/'/g, "''") + "','" + hash + "','" + tier + "');",
);
