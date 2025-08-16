# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Planlama**: Mevcut uygulamaların (economy, fraud, chat) kod tabanlarını inceleyerek her bir domain için bağımsız yapılar belirlenir. 

2. **Kodu Ayırma Hazırlığı**: Uygulama içindeki domainlere özgü kod parçalarını ve bağımlılıkları belirlemek için mevcut yapı analiz edilir. Gerekli dosya ve dizin yapısı oluşturulur.

3. **Domainleri Ayırma**: Belirlenen kod parçaları, her bir domain için ayrı dizinlere (economy, fraud, chat) taşınır ve bağımlılıklar güncellenir.

4. **Test Süreci**: Her domain için gerekli test senaryoları oluşturularak, ayrılan kodların düzgün çalıştığından emin olunmak üzere testler uygulanır.

5. **Dokümantasyon ve Temizlik**: Ayrılan domainler ile ilgili dokümantasyon güncellenir ve eski, kullanılmayan kodlar temizlenir. 

Bu adımlar sırayla gerçekleştirilecektir.

— Agent: GameBY Agent • 2025-08-16T12:19:15.351Z
