#!/bin/sh
set -e

DATA_DIR="${PB_DATA_DIR:-/pb_data}"
HTTP_PORT="${PORT:-8080}"

mkdir -p "$DATA_DIR"

# Railway ortam değişkenlerinde PB_ADMIN_EMAIL ve PB_ADMIN_PASSWORD tanımlıysa süper kullanıcıyı otomatik oluştur/güncelle
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  /pb/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir="$DATA_DIR" >/dev/null 2>&1 || true
fi

exec /pb/pocketbase serve \
  --http="0.0.0.0:${HTTP_PORT}" \
  --dir="$DATA_DIR" \
  --migrationsDir="/pb/pb_migrations"
