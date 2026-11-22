# Çoklu-PC Senkronizasyon ve Canlı Yayın Kuralları (Zorunlu)

Bu proje üzerinde birden fazla bilgisayarda çalışılmaktadır. Her oturumda ve her değişiklikte aşağıdaki kurallara istisnasız uyulmalıdır:

1. **İşe Başlamadan Önce Senkronizasyon (`git pull`):**
   - Dosyalarda herhangi bir değişiklik yapmadan önce diğer bilgisayarda yapılmış olabilecek güncellemeleri almak için her zaman `git pull --rebase origin main` çalıştır.

2. **Her Değişiklik Sonrası Derleme, Canlıya Alma ve Git Push:**
   - Yapılan her kod/içerik değişikliği tamamlandığında sırasıyla:
     1. `pnpm build` çalıştırarak statik dışa aktarımın (`out/`) hatasız derlendiğini doğrula.
     2. `firebase deploy --only hosting` çalıştırarak güncel `out/` çıktısını Firebase Hosting üzerinden canlıya (`https://bdimexport64.web.app`, proje: `bdimexport64`) al.
     3. Değişiklikleri anlamlı bir commit mesajıyla kaydet ve `git push origin main` ile GitHub reposuna (`https://github.com/batu64/bdimexport_2.git`) gönder.

3. **Gizli Bilgi Güvenliği:**
   - GitHub PAT, API anahtarları veya token'lar asla kaynak dosyalara ya da commit geçmişine yazılmaz; yalnızca sistem kimlik bilgisi yöneticisinde (Git Credential Manager / `.env.local`) tutulur.
