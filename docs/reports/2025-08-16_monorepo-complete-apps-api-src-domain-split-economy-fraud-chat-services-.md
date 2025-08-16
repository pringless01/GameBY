# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Uygulama içerisindeki mevcut domain yapısını incele ve her bir hizmetin (economy, fraud, chat) gereksinimlerini belirle.

2. **Klasör Yapısı Oluşturma**: apps/api/src dizininde her bir domain için ayrı klasörler oluştur (economy, fraud, chat).

3. **Kod Taşınması**: Mevcut kodları uygun domain klasörlerine taşı ve her bir domainin bağımlılıklarını kontrol et.

4. **Bağımlılık Yönetimi**: Taşınan kodların çalışabilmesi için gerekli bağımlılıkları güncelle ve her bir domain için bağımsız olarak çalıştıklarından emin ol.

5. **Test ve Doğrulama**: Her bir domain için testler yaz ve mevcut testleri güncelleyerek yeni yapının düzgün çalıştığını doğrula.

— Agent: GameBY Agent • 2025-08-16T14:55:58.235Z
