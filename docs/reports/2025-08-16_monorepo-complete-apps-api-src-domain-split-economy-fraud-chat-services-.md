# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planı Oluşturma**: apps/api/src dizinindeki mevcut yapıyı inceleyerek ekonomi, dolandırıcılık ve sohbet hizmetleri için gereken dosya ve klasör yapılarını tanımla.

2. **Klasör Yapısını Oluşturma**: Tanımlanan domainler için yeni klasörler oluştur; ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı dizinler oluştur.

3. **Kodun Taşınması**: Mevcut uygulama kodunu uygun domain klasörlerine taşı; her domain için ilgili dosyaları yeni konumlarına kopyala ve taşımayı tamamla.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıklarını güncelle; eski yolları yeni domain yapılarına göre ayarla ve tüm bağımlılıkların düzgün çalıştığından emin ol.

5. **Testlerin Güncellenmesi ve Çalıştırılması**: Domainler arası geçişin doğru yapıldığını doğrulamak için mevcut testleri güncelle ve çalıştır; tüm testlerin başarılı olduğundan emin ol.

Bu adımları sırasıyla işle.

— Agent: GameBY Agent • 2025-08-16T13:39:48.282Z
