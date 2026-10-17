#!/usr/bin/env bash
# FAZ_3 3.9 — Haftalık D1 → R2 yedeği (production). docs/deploy.md §7.
#
#   bash scripts/d1-backup.sh            → DRY-RUN: çalışacak komutları yazar, hiçbir şey yapmaz (varsayılan)
#   bash scripts/d1-backup.sh --apply    → prod D1'i export eder, gzip'ler, ÖZEL R2 bucket'ına yükler
#
# Env (değerler ASLA log'a yazılmaz; yalnız varlığı kontrol edilir):
#   CLOUDFLARE_API_TOKEN   zorunlu — izin: Account › D1 › Edit (export için) + Account › Workers R2 Storage › Edit
#   CLOUDFLARE_ACCOUNT_ID  zorunlu
#   D1_BACKUP_ENV          ops. — varsayılan production
#   D1_BACKUP_BUCKET       ops. — varsayılan bdimexport-backups (ÖZEL bucket; public medya bucket'ı DEĞİL)
#
# Notlar:
#   - Yalnız OKUMA yapar (export). Prod D1'e yazmaz.
#   - D1 export sırasında veritabanı kısa süre istek kabul etmeyebilir → düşük trafik saatinde çalıştır.
#   - Saklama süresi: R2 bucket'ında lifecycle kuralı (öneri 90 gün) — panelden (docs/deploy.md §7).
#   - D1 Time Travel ayrıca nokta-zamana dönüşü sağlar; bu yedek ondan BAĞIMSIZ, hesap dışı kopya içindir.
set -euo pipefail

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1
ENV_NAME="${D1_BACKUP_ENV:-production}"
BUCKET="${D1_BACKUP_BUCKET:-bdimexport-backups}"
DB_NAME="bdimexport-db"
[[ "$ENV_NAME" == "staging" ]] && DB_NAME="bdimexport-db-staging"

missing=()
[[ -z "${CLOUDFLARE_API_TOKEN:-}" ]] && missing+=("CLOUDFLARE_API_TOKEN")
[[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]] && missing+=("CLOUDFLARE_ACCOUNT_ID")
if (( APPLY )) && (( ${#missing[@]} )); then
  echo "HATA: eksik env: ${missing[*]}" >&2
  exit 1
fi

STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
OUT="$WORK/${DB_NAME}-${STAMP}.sql"
KEY="d1/${ENV_NAME}/${DB_NAME}-${STAMP}.sql.gz"
API_DIR="$(cd "$(dirname "$0")/../workers/api" && pwd)"

run() {
  if (( APPLY )); then "$@"; else printf 'DRY-RUN: %s\n' "$*"; fi
}

echo "mod: $([[ $APPLY == 1 ]] && echo APPLY || echo DRY-RUN) · env: $ENV_NAME · db: $DB_NAME · hedef: r2://$BUCKET/$KEY"
cd "$API_DIR"
run npx wrangler d1 export "$DB_NAME" --env "$ENV_NAME" --remote --output "$OUT"
run gzip -9 "$OUT"
run npx wrangler r2 object put "$BUCKET/$KEY" --file "$OUT.gz" --content-type application/gzip --remote
if (( APPLY )); then
  bytes=$(wc -c < "$OUT.gz")
  (( bytes > 100 )) || { echo "HATA: yedek dosyası şüpheli küçük ($bytes bayt)" >&2; exit 1; }
  echo "tamam: $KEY ($bytes bayt)"
fi
