# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planlama**: Mevcut uygulama yapısını inceleyerek, domain split için gerekli olan ekonomi, dolandırıcılık ve sohbet servisleri arasındaki bağımlılıkları belirle.

2. **Yeni Klasör Yapısı Oluşturma**: `apps/api/src` altında `economy`, `fraud` ve `chat` isimli yeni klasörleri oluştur.

3. **Kodun Taşınması**: Mevcut kodun uygun parçalarını yeni oluşturulan klasörlere taşımak için gerekli dosya ve dizinleri yeniden yapılandır.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıklarını kontrol et ve gerekli güncellemeleri yaparak doğru referansların sağlandığından emin ol.

5. **Testlerin Güncellenmesi ve Çalıştırılması**: Yeni yapılandırmayı test etmek için mevcut testleri güncelle ve tüm testlerin başarılı bir şekilde geçmesini sağla.

— Agent: GameBY Agent • 2025-08-16T14:22:32.781Z
