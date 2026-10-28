#!/usr/bin/env bash
# Tasarım QA ekran görüntüsü (headless Edge): scripts/shot.sh <url-path> <çıktı-adı> [genişlik,yükseklik] [light|dark]
# Örn: scripts/shot.sh / after-tr-home-desktop 1440,2400  → qa/TASARIM/screens/after-tr-home-desktop.png
# Mobil (<500 px): MOBILE=1 → scripts/shot-frame.html içinde gerçek genişlikte iframe (Edge min. pencere genişliği sınırı).
# msedge başlatıcısı hemen döner, dosyayı arka planda yazar → dosya ≤30 sn beklenir; olmazsa yeniden dener (3).
set -uo pipefail
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
FILE="$PWD/qa/TASARIM/screens/$2.png"
OUT="$(cygpath -w "$FILE")"
SCHEME=()
SIZE="${3:-1440,900}"
URL="http://localhost:${PORT:-3000}$1"
if [ -n "${MOBILE:-}" ]; then
  W="${SIZE%,*}"; H="${SIZE#*,}"
  URL="file:///$(cygpath -m "$PWD/scripts/shot-frame.html")?w=$W&h=$H&path=$1&port=${PORT:-3000}"
  SIZE="$((W < 520 ? 520 : W)),$H"
fi
[ "${4:-}" = dark ] && SCHEME=(--force-dark-mode --blink-settings=preferredColorScheme=0)
rm -f "$FILE"
for try in 1 2 3; do
  "$EDGE" --headless=new --disable-gpu --hide-scrollbars --no-first-run ${SCHEME[@]+"${SCHEME[@]}"} \
    --user-data-dir="$(cygpath -w "${TEMP:-/tmp}/edge-shot")" --window-size="$SIZE" \
    --virtual-time-budget=5000 --screenshot="$OUT" "$URL" >/dev/null 2>&1
  for _ in $(seq 60); do [ -s "$FILE" ] && { sleep 1; echo "$OUT"; exit 0; }; sleep 0.5; done
done
echo "HATA: ekran görüntüsü alınamadı ($2)" >&2; exit 1
