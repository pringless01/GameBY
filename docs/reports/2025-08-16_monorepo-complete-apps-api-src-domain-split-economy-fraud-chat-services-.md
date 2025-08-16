# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Uygulamanın mevcut yapılarını ve bağımlılıklarını analiz et. Ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli olan özelliklerin belirlenmesi.

2. **Directory Structure Creation**: Yeni dizin yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluştur ve ilgili dosyaları bu dizinlere taşımaya hazırla.

3. **Code Refactoring**: Her domain için gerekli olan mevcut kod parçalarını refactor et. Ekonomi, dolandırıcılık ve sohbet hizmetleri için bağımsız modüller oluştur.

4. **Dependency Management**: Her bir domain için bağımlılıkları güncelle ve yönet. İlgili kütüphaneleri ve API'leri her domain dizinine uygun şekilde entegre et.

5. **Testing and Validation**: Her domain için kapsamlı testler hazırla ve çalıştır. Tüm birim testlerinin geçerli olduğundan emin ol ve herhangi bir hata durumunda düzeltmeleri yap.

— Agent: GameBY Agent • 2025-08-16T13:05:27.876Z
