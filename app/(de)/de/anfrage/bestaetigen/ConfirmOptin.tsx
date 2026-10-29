// /de/anfrage/bestaetigen — çift opt-in onayı (FAZ_5 5.6, 🔒). Token URL FRAGMENT'inde (#t=…): sunucu loglarına/Referer'a gitmez;
// okunur okunmaz adres çubuğundan silinir. POST {API_BASE}/api/v1/de/optin/bestaetigen → 200 bestätigt / 410 abgelaufen / 400 ungültig.
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import st from "@/app/components/form.module.css";
import dict from "@/lib/messages/de.json";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
type State = "checking" | "ok" | "expired" | "invalid" | "unavailable";

export default function ConfirmOptin() {
  const [state, setState] = useState<State>("checking");
  const t = dict.anfrage.confirm;

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("t") ?? "";
    if (token) window.history.replaceState(null, "", window.location.pathname); // token adres çubuğunda kalmaz
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) { setState("invalid"); return; }
    if (!API_BASE) { setState("unavailable"); return; }
    fetch(`${API_BASE}/api/v1/de/optin/bestaetigen`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => setState(r.ok ? "ok" : r.status === 410 ? "expired" : r.status === 400 ? "invalid" : "unavailable"))
      .catch(() => setState("unavailable"));
  }, []);

  if (state === "checking") {
    return <div role="status" className={st.notice}><Loader2 aria-hidden="true" className={st.spin} /> {t.checking}</div>;
  }
  if (state === "ok") {
    return (
      <div role="status" className={st.done}>
        <CheckCircle2 aria-hidden="true" className={st.doneIcon} />
        <p>{t.ok}</p>
      </div>
    );
  }
  return (
    <div role="alert" className={st.notice}>
      <p><AlertCircle aria-hidden="true" className={st.errIcon} /> {t[state]}</p>
      {state !== "unavailable" && <p><a href="/de/anfrage">{t.again}</a></p>}
    </div>
  );
}
