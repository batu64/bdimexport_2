// /zh WeChat QR büyütme (FAZ_5 5.6) — statik, istemci tarafı. Native <dialog>: odak kapanı + Esc + backdrop tıklamayla kapanır,
// açılınca odak "关闭"'da, kapanınca QR düğmesine döner. Hareket yalnız prefers-reduced-motion: no-preference'ta (CSS).
"use client";

import { useRef } from "react";
import CopyButton from "@/lib/ui/CopyButton";
import wc from "@/lib/ui/wechat.module.css";
import s from "./wechat-zoom.module.css";

export type ZoomLabels = { scanShort: string; zoom: string; zoomHint: string; close: string; idLabel: string; copy: string; copied: string };

export default function WeChatQrZoom({ qr, wechatId, labels }: { qr: string; wechatId: string; labels: ZoomLabels }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const close = () => dlg.current?.close();
  return (
    <>
      <button ref={btn} type="button" className={s.qrBtn} aria-haspopup="dialog" aria-label={`${labels.zoom}: ${labels.idLabel} ${wechatId}`}
        onClick={() => dlg.current?.showModal()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export: images.unoptimized; QR keskin kalmalı */}
        <img src={qr} alt="" width={192} height={192} />
      </button>
      <dialog ref={dlg} className={s.dialog} aria-labelledby="wechat-zoom-title"
        onClose={() => btn.current?.focus()}
        onClick={(e) => { if (e.target === dlg.current) close(); }}>
        <div className={s.inner}>
          <h2 id="wechat-zoom-title" className={s.title}>{labels.scanShort}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element -- büyük QR (aynı dosya, ölçek CSS) */}
          <img src={qr} alt={`${labels.scanShort}: ${wechatId}`} width={384} height={384} className={s.big} />
          <p className={wc.idRow}>
            <span className={wc.idLabel}>{labels.idLabel}</span>
            <code className={wc.id}>{wechatId}</code>
          </p>
          <CopyButton text={wechatId} label={labels.copy} done={labels.copied} className={wc.copy} />
          <p className={s.hint}>{labels.zoomHint}</p>
          <button type="button" className={s.close} onClick={close} autoFocus>{labels.close}</button>
        </div>
      </dialog>
    </>
  );
}
