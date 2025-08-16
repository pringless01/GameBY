# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Belirleme**: Mevcut apps/api/src dizinindeki mevcut dosya yapısını inceleyerek her bir domain (economy, fraud, chat) için gerekli alt dizinleri ve dosyaları belirle.

2. **Yeni Dizinlerin Oluşturulması**: Belirlenen domain yapısına göre apps/api/src altında economy, fraud ve chat dizinlerini oluştur.

3. **Dosyaların Taşınması**: Mevcut kod ve dosyaları uygun domain dizinlerine taşımak için gerekli dosya hareketlerini gerçekleştir.

4. **Bağımlılıkların Güncellenmesi**: Taşınan dosyaların bağımlılıklarını kontrol ederek, her bir domain için gerekli olan bağımlılıkların güncellenmesini sağla.

5. **Testlerin Güncellenmesi ve Çalıştırılması**: Taşınan kodun düzgün çalıştığından emin olmak için mevcut testleri güncelle ve tüm testlerin başarıyla geçtiğini doğrula.

— Agent: GameBY Agent • 2025-08-16T13:07:36.405Z
