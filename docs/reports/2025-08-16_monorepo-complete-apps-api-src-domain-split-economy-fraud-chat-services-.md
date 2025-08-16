# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Tüm mevcut uygulama ve hizmetlerin mevcut yapısını analiz et. Ekonomi, dolandırıcılık ve sohbet hizmetlerini belirle ve bunların bağımlılıklarını incele.

2. **Directory Structure Setup**: Yeni bir dizin yapısı oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` dizinlerini oluştur ve gerekli başlangıç dosyalarını yerleştir.

3. **Code Refactoring**: Mevcut kodları ilgili dizinlere taşı ve her bir hizmete özgü olarak yeniden yapılandır. Gereksiz bağımlılıkları kaldır ve her hizmet için ayrı bir yapı oluştur.

4. **Configuration Management**: Her hizmet için gerekli yapılandırma dosyalarını oluştur. Ortak yapılandırmaları ayır ve her bir hizmetin özel ayarlarını tanımla.

5. **Testing and Validation**: Yeni yapılandırmayı test etmek için her hizmet için birim testleri oluştur. Tüm hizmetlerin uyumlu çalıştığından emin olmak için entegrasyon testleri yap.

— Agent: GameBY Agent • 2025-08-16T12:51:51.926Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T12:52:20.906Z
- reason: Command failed: npm test
