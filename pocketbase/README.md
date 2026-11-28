# Bdimexport PocketBase + Railway Veritabanı Motoru

Bu klasör, `bdimexport.com` Dış Ticaret Radarı araçlarının (1'den 8'e kadar tüm modüller + `radar_subscriptions` nitelikli lead/alarm abonelik tablosu) çalıştığı **PocketBase** sunucu yapılandırmasını barındırır.

## Mimarinin Çalışma Prensibi
1. **Tek Doğruluk Kaynağı (`../data-pool/`):** Tüm referans veriler önce `data-pool/` altında resmi kaynaklardan üretilir, `node data-pool/scripts/verify-all.mjs` ile matematiksel olarak doğrulanır ve Git ile tüm bilgisayarlar arasında senkronize tutulur.
2. **Şema Göçleri (`pb_migrations/`):** PocketBase koleksiyon şemaları bu klasörde versiyonlanır; Railway üzerinde konteyner kalkarken otomatik uygulanır.
3. **Kalıcı Disk (`/pb_data`):** Railway üzerinde bu servise `/pb_data` yolunda bir **Volume** bağlanır. Canlıdaki müşteri abonelikleri (`radar_subscriptions`) ve veritabanı dosyası konteyner yeniden başlasa bile silinmez.

## Yerel Çalıştırma ve Senkronizasyon
```powershell
# 1. Veri havuzundaki tüm aktif veritabanlarını doğrula
node data-pool/scripts/verify-all.mjs

# 2. Yerel PocketBase sunucusunu başlat (varsayılan: http://127.0.0.1:8090)
.\pocketbase\bin\pocketbase.exe serve --dir=pocketbase/pb_data --migrationsDir=pocketbase/pb_migrations

# 3. Doğrulanmış veri havuzunu PocketBase'e (yerel veya Railway) aktar
$env:PB_URL="http://127.0.0.1:8090"
$env:PB_ADMIN_EMAIL="admin@bdimexport.com"
$env:PB_ADMIN_PASSWORD="<güçlü-parola>"
node data-pool/scripts/sync-pocketbase.mjs
```

## Railway Ortam Değişkenleri (Canlıya Alırken)
- `PB_ADMIN_EMAIL`: PocketBase `/_/` yönetim paneli giriş e-postası
- `PB_ADMIN_PASSWORD`: En az 12 karakterli güçlü yönetici şifresi
- `PB_DATA_DIR`: `/pb_data` (Railway Volume mount path)
