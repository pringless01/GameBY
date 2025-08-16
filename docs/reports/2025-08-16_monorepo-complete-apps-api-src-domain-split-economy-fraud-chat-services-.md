# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Proje Analizi**: Mevcut apps/api/src dizinindeki dosyaların ve bağımlılıkların analizi yapılacak. Hangi dosyaların economy, fraud ve chat servislerine ayrılacağını belirlemek için bir liste oluşturulacak.

2. **Dizin Yapısı Oluşturma**: Yeni domain yapısına uygun olarak economy, fraud ve chat dizinleri oluşturulacak. Her dizin için temel yapı ve gerekli dosyalar yerleştirilecek.

3. **Kod Taşıma ve Ayrıştırma**: Mevcut kodlar, belirlenen domainlere uygun olarak yeni dizinlere taşınacak. Her bir servis için spesifik olan dosyalar ayrıştırılacak ve uygun dizinlere yerleştirilecek.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodların bağımlılıkları güncellenecek. Yeni dizinlerdeki yapılandırmaların doğru çalışması için gerekli ayarlamalar yapılacak.

5. **Test ve Doğrulama**: Tüm değişikliklerin ardından, yeni dizin yapısının ve taşınan kodların doğru çalıştığını doğrulamak için testler gerçekleştirilecek. Başarılı test sonuçları ile işlemler tamamlanacak.

— Agent: GameBY Agent • 2025-08-16T13:56:37.864Z


## Fail checkpoint (attempt 2)
- time: 2025-08-16T13:57:06.969Z
- reason: Command failed: npm test
