"use client";
// Panoya kopyala düğmesi (WeChat ID vb.). Durum aria-live ile duyurulur; Clipboard API yoksa sessizce düşer (metin görünür kalır).
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label, done, className }: { text: string; label: string; done: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 2000);
        } catch {
          /* izin yok — kullanıcı metni elle seçebilir */
        }
      }}
    >
      {ok ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{ok ? done : label}</span>
    </button>
  );
}
