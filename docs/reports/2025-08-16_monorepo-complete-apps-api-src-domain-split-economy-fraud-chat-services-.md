# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

### Alt Adım 1: Proje Yapısını Gözden Geçir
- Mevcut `apps/api/src` dizin yapısını incele.
- `economy`, `fraud` ve `chat` servislerinin gereksinimlerini belirle.

### Alt Adım 2: Yeni Dizini Oluştur
- `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluştur.
- Her bir dizin için gerekli başlangıç dosyalarını ekle.

### Alt Adım 3: Kodun Taşınması
- Mevcut kodları uygun servis dizinlerine taşımaya başla.
- Her taşınma işlemi sonrası dosyaların doğru çalıştığını test et.

### Alt Adım 4: Bağımlılıkları Güncelle
- Her yeni servis için gerekli bağımlılıkları belirle ve güncelle.
- `package.json` dosyalarını kontrol et ve güncellemeleri yap.

### Alt Adım 5: Test Süreçlerini Güncelle
- Taşınan kodlar için uygun test senaryolarını oluştur.
- Testleri çalıştır ve geçip geçmediğini kontrol et.

— Agent: GameBY Agent • 2025-08-16T14:19:34.526Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:19:38.825Z
- reason: Command failed: npm run lint
