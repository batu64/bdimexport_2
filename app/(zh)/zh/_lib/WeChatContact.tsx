// /zh WeChat iletişim kartı (FAZ_5 5.6 davranışı) — D6 görünümü (lib/ui/wechat.module.css) + QR dokun-büyüt (WeChatQrZoom).
// lib/ui/WeChatCard'ın /zh sürümü: scope kilidi gereği davranış app/(zh)'de. Değerler build env'den (NEXT_PUBLIC_WECHAT_ID / _QR);
// tanımsızsa uydurma QR/ID GÖSTERİLMEZ → "即将上线" + e-posta. Masaüstü: QR + ID; mobil: dokun → büyük QR + 复制微信号 (+ 打开微信).
import { Mail, QrCode, ZoomIn } from "lucide-react";
import CopyButton from "@/lib/ui/CopyButton";
import wc from "@/lib/ui/wechat.module.css";
import dict from "@/lib/messages/zh.json";
import WeChatQrZoom from "./WeChatQrZoom";
import z from "./wechat-zoom.module.css";

const WECHAT_ID = process.env.NEXT_PUBLIC_WECHAT_ID || "bdimexport";
const WECHAT_QR = process.env.NEXT_PUBLIC_WECHAT_QR || "/media/brand/wechat-qr.jpg";

export default function WeChatContact({ id = "wechat", email }: { id?: string; email: string }) {
  const l = dict.wechat;
  const live = WECHAT_ID !== "" && WECHAT_QR !== "";
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={wc.card}>
      <div className={wc.qr} data-live={live || undefined}>
        {live ? <WeChatQrZoom qr={WECHAT_QR} wechatId={WECHAT_ID} labels={l} /> : <QrCode aria-hidden="true" className={wc.qrIcon} />}
        <span className={wc.corner} aria-hidden="true" />
      </div>
      <div className={wc.body}>
        <h2 id={`${id}-title`} className={wc.title}>{l.title}</h2>
        {live ? (
          <>
            <p className={wc.scan}>{l.scan}</p>
            <span className={z.zoomHint}><ZoomIn aria-hidden="true" />{l.zoom}</span>
            <p className={wc.idRow}>
              <span className={wc.idLabel}>{l.idLabel}</span>
              <code className={wc.id}>{WECHAT_ID}</code>
            </p>
            <div className={wc.actions}>
              <CopyButton text={WECHAT_ID} label={l.copy} done={l.copied} className={wc.copy} />
              <a href="weixin://" className={wc.open}>{l.open}</a>
            </div>
          </>
        ) : (
          <>
            <p className={wc.scan} role="status">{l.pending}</p>
            <a href={`mailto:${email}`} className={wc.copy}>
              <Mail aria-hidden="true" className={wc.btnIcon} />
              {l.email}
            </a>
          </>
        )}
      </div>
    </section>
  );
}
