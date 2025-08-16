# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Mevcut uygulamanın (apps/api/src) yapılarını ve bağımlılıklarını analiz et. Hangi bileşenlerin ekonomi, dolandırıcılık ve sohbet hizmetlerine ait olduğunu belirle.

2. **Directory Structure Update**: Yeni dizin yapısını oluştur. Ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli klasörleri (economy/, fraud/, chat/) apps/api/src altında oluştur.

3. **Code Refactoring**: Belirlenen bileşenleri uygun dizinlere taşı. Her bir hizmetin kodunu ilgili klasöre yerleştir ve bağımlılıkları güncelle.

4. **Configuration Management**: Her bir hizmet için gerekli yapılandırma dosyalarını oluştur. Ortak yapılandırmaları dışlayarak her hizmetin kendi yapılandırmasını yönetilebilir hale getir.

5. **Testing and Validation**: Yeni yapılandırmayı test et. Her hizmetin bağımsız olarak çalıştığından emin olmak için birim testleri ve entegrasyon testleri gerçekleştir. 

Her adımın ardından gerekli dosya değişiklikleri yapılacak ve rapor güncellenecektir.

— Agent: GameBY Agent • 2025-08-16T12:40:09.695Z
