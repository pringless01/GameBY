# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

### Alt Adım 1: Ekonomi Servisi Yapılandırması
- apps/api/src/economy dizini oluşturulacak.
- Ekonomi ile ilgili mevcut dosyalar taşınacak.
- Gerekli bağımlılıklar ve konfigürasyonlar eklenecek.

### Alt Adım 2: Dolandırıcılık Servisi Yapılandırması
- apps/api/src/fraud dizini oluşturulacak.
- Dolandırıcılık ile ilgili mevcut dosyalar taşınacak.
- Bu servise özel bağımlılıklar ve konfigürasyonlar eklenecek.

### Alt Adım 3: Sohbet Servisi Yapılandırması
- apps/api/src/chat dizini oluşturulacak.
- Sohbet ile ilgili mevcut dosyalar taşınacak.
- Sohbet servisine özel bağımlılıklar ve konfigürasyonlar eklenecek.

### Alt Adım 4: Ortak Bağımlılıkların Güncellenmesi
- Tüm servislerin ortak kullandığı bağımlılıklar kontrol edilecek.
- Gerekirse bağımlılıklar güncellenecek ve optimize edilecek.

### Alt Adım 5: Testlerin Güncellenmesi ve Çalıştırılması
- Her servisin test dosyaları gözden geçirilecek ve güncellenecek.
- Testler çalıştırılacak ve sonuçlar kontrol edilecek.

— Agent: GameBY Agent • 2025-08-16T13:53:50.488Z
