// Microsoft Clarity Özel Olay (Smart Event), Oturum Etiketi (Custom Tag) ve Öncelikli Kayıt (Upgrade) Yardımcıları.
// window.clarity kuyruğu (ClarityScript.tsx) sayfa açılışında hazır olduğu için ilk tıklamadan itibaren kayıpsız çalışır.

type ClarityFn = {
  (command: "event", eventName: string): void;
  (command: "set", key: string, value: string | string[]): void;
  (command: "upgrade", reason: string): void;
};

function getClarity(): ClarityFn | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { clarity?: ClarityFn };
  return typeof w.clarity === "function" ? w.clarity : undefined;
}

export function clarityEvent(eventName: string): void {
  const c = getClarity();
  if (!c) return;
  c("event", eventName);
  c("set", "last_cta", eventName);
}

export function claritySet(key: string, value: string | string[]): void {
  getClarity()?.("set", key, value);
}

export function clarityUpgrade(reason: string): void {
  getClarity()?.("upgrade", reason);
}
