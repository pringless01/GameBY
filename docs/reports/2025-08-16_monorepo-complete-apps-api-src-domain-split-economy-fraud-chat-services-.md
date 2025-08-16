# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Analiz Et**: Mevcut apps/api/src dizin yapısını incele ve hangi bileşenlerin ekonomi, dolandırıcılık ve sohbet hizmetlerine ait olduğunu belirle.

2. **Klasör Yapısını Oluştur**: Yeni domain yapılarına göre klasörleri oluştur. apps/api/src altında economy, fraud ve chat dizinlerini oluştur.

3. **Kodun Taşınması**: İlgili hizmetlere ait kodları mevcut dizinler içinden uygun yeni dizinlere taşımak için gerekli dosyaları belirle ve taşı.

4. **Bağımlılıkları Güncelle**: Taşınan kodların bağımlılıklarını kontrol et ve her yeni domain dizini için gerekli olan bağımlılıkları güncelleyerek uygun şekilde ayarlamaları yap.

5. **Testlerin Güncellenmesi**: Taşınan kodlar için test dosyalarını güncelle ve yeni dizin yapısına göre testlerin çalıştığından emin olmak için testleri çalıştır.

— Agent: GameBY Agent • 2025-08-16T11:49:42.340Z
