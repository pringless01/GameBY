# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını İnceleme**: Mevcut apps/api/src dizinindeki domain yapılarını gözden geçirerek, hangi dosyaların ekonomi, dolandırıcılık ve sohbet hizmetlerine ait olduğunu belirle.

2. **Yeni Dizin Yapısı Oluşturma**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı dizinler oluştur. Her bir hizmet için uygun klasör yapısını tanımla.

3. **Kodun Taşınması**: Belirlenen dosyaları mevcut dizinden yeni oluşturulan ekonomik, dolandırıcılık ve sohbet hizmeti dizinlerine taşı. 

4. **Bağımlılıkları Güncelleme**: Taşınan her bir hizmet için gerekli bağımlılıkları güncelle ve her hizmetin bağımsız çalışmasını sağla.

5. **Test ve Doğrulama**: Her bir hizmet için testleri çalıştırarak taşınmanın düzgün yapıldığını doğrula. Tüm testlerin başarılı olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T13:01:33.893Z
