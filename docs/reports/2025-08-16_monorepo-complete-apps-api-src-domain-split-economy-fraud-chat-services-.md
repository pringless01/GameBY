# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: Domain Yapılandırması
- apps/api/src klasöründeki mevcut yapı incelenecek ve domain'lerin (economy, fraud, chat) ayrılması için gerekli dosya ve klasör yapısı oluşturulacak.

Alt Adım 2: Economy Servisi Ayrıştırma
- Economy ile ilgili tüm dosyalar ve kodlar apps/api/src klasöründen ayrılarak yeni bir economy servisi oluşturulacak. Gerekli bağımlılıklar güncellenecek.

Alt Adım 3: Fraud Servisi Ayrıştırma
- Fraud ile ilgili tüm dosyalar ve kodlar ayrılarak yeni bir fraud servisi oluşturulacak. Ek olarak, bu servisin bağımlılıkları kontrol edilecek ve güncellenecek.

Alt Adım 4: Chat Servisi Ayrıştırma
- Chat ile ilgili tüm dosyalar ve kodlar ayrılarak yeni bir chat servisi oluşturulacak. Servis ile ilişkili bağımlılıklar gözden geçirilecek ve güncellenerek doğru bir yapı sağlanacak.

Alt Adım 5: Test ve Entegrasyon
- Yeni oluşturulan domain servisleri için testler yazılacak ve entegrasyon testleri gerçekleştirilecek. Tüm sistemin uyumlu çalıştığı doğrulanacak.

— Agent: GameBY Agent • 2025-08-16T12:14:36.560Z
