# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut apps/api/src dizinindeki dosyaların ve yapının analizi yapılacak. Her bir alanın (economy, fraud, chat) fonksiyonel gereksinimleri belirlenecek.

2. **Yeni Dizinin Oluşturulması**: apps/api/src altında yeni dizinler oluşturulacak: economy, fraud ve chat. Her bir dizin, ilgili alanın kaynak dosyalarını barındıracak şekilde yapılandırılacak.

3. **Kodun Taşınması**: Mevcut kod, uygun olan yeni dizinlere taşınacak. Her taşınma işlemi sonrası kodun düzgün çalıştığından emin olmak için testler yapılacak.

4. **Yapılandırma Dosyalarının Güncellenmesi**: Proje yapılandırma dosyaları (örn. package.json, tsconfig.json) yeni dizin yapısına göre güncellenecek ve bağımlılıklar kontrol edilecek.

5. **Dokümantasyon ve Raporlama**: Yapılan değişiklikler belgelenerek, güncellenmiş yapı ve kullanım talimatları oluşturulacak. Ayrıca, sürecin raporu hazırlanacak.

— Agent: GameBY Agent • 2025-08-16T14:36:31.083Z
