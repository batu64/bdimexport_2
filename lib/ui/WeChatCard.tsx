// WeChat iletişim kartı (/zh birincil kanal — I18N_RULES §2). QR + 微信号 + kopyala / (mobilde) WeChat'i aç.
// Değerler build env'den: NEXT_PUBLIC_WECHAT_ID, NEXT_PUBLIC_WECHAT_QR (public/ altındaki QR görsel yolu). Tanımlı değilse
// uydurma QR/ID GÖSTERİLMEZ → dürüst "即将上线" durumu + e-posta. Metin çağırandan (zh.json).
import { MessageCircle, QrCode } from "lucide-react";
import CopyButton from "./CopyButton";
import EmailSmartAction from "./EmailSmartAction";
import { OFFICIAL_WHATSAPP_WA } from "./entities";
import s from "./wechat.module.css";

export type WeChatLabels = { title: string; scan: string; idLabel: string; copy: string; copied: string; open: string; pending: string; email: string };

const WECHAT_ID = process.env.NEXT_PUBLIC_WECHAT_ID ?? "";
const WECHAT_QR = process.env.NEXT_PUBLIC_WECHAT_QR ?? "";

export default function WeChatCard({ id = "wechat", labels, email }: { id?: string; labels: WeChatLabels; email: string }) {
  const live = WECHAT_ID !== "" && WECHAT_QR !== "";
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={s.card}>
      <div className={s.qr} data-live={live || undefined}>
        {live ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export: images.unoptimized; QR keskin kalmalı
          <img src={WECHAT_QR} alt={`${labels.scan}: ${WECHAT_ID}`} width={192} height={192} />
        ) : (
          <QrCode aria-hidden="true" className={s.qrIcon} />
        )}
        <span className={s.corner} aria-hidden="true" />
      </div>
      <div className={s.body}>
        <h2 id={`${id}-title`} className={s.title}>{labels.title}</h2>
        {live ? (
          <>
            <p className={s.scan}>{labels.scan}</p>
            <p className={s.idRow}>
              <span className={s.idLabel}>{labels.idLabel}</span>
              <code className={s.id}>{WECHAT_ID}</code>
            </p>
            <div className={s.actions}>
              <CopyButton text={WECHAT_ID} label={labels.copy} done={labels.copied} className={s.copy} />
              <a href="weixin://" className={s.open}>{labels.open}</a>
            </div>
          </>
        ) : (
          <>
            <p className={s.scan} role="status">{labels.pending}</p>
            <div className={s.actions}>
              <EmailSmartAction
                to={email}
                subject="Bdimexport 中文商务咨询 (bdimexport.com/zh)"
                label={labels.email}
                locale="zh"
                variant="primary"
                whatsappHref={OFFICIAL_WHATSAPP_WA}
                eventName="zh_wechat_card_email"
              />
              <a
                href={OFFICIAL_WHATSAPP_WA}
                target="_blank"
                rel="noopener noreferrer"
                className={s.open}
              >
                <MessageCircle aria-hidden="true" className={s.btnIcon} />
                <span>WhatsApp 国际直连</span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
