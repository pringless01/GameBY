# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için mevcut uygulama yapılarını incele ve her bir domainin gereksinimlerini belirle.

2. **Directory Structure Creation**: Her bir domain için uygun dizin yapısını oluştur; `economy`, `fraud`, ve `chat` adında alt dizinler oluştur.

3. **Code Refactoring**: Mevcut kodu, belirlenen domainlere göre yeniden düzenle ve her bir domainin işlevselliğini ayrı dosyalara ayır.

4. **Dependency Management**: Her domainin ihtiyaç duyduğu bağımlılıkları belirle ve uygun şekilde güncelle; gerekli bağımlılıkları her bir domain dizinine ekle.

5. **Testing and Validation**: Yapılan değişiklikleri test et; her bir domain için birim testleri oluştur ve tüm testlerin geçerli olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T13:03:52.842Z
