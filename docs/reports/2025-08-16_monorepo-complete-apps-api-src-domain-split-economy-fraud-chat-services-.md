# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planı Hazırlama**: Ekonomi, dolandırıcılık ve sohbet hizmetleri için mevcut API yapısını analiz et ve her bir alan için bağımsız bileşenlerin nasıl yapılandırılacağını belirle.

2. **Kod Tabanını İnceleme**: Mevcut `apps/api/src` dizinindeki kodları gözden geçirerek hangi dosyaların ve sınıfların hangi alanlara ait olduğunu belirle.

3. **Yeni Dizin Yapısını Oluşturma**: `economy`, `fraud` ve `chat` hizmetleri için yeni dizin yapısını oluştur ve gerekli klasörleri oluştur.

4. **Kod Taşınması**: Belirlenen dosyaları ve sınıfları uygun yeni dizinlere taşı ve her bir alan için gerekli bağımlılıkları güncelle.

5. **Test ve Doğrulama**: Taşınan kodların doğru çalıştığını doğrulamak için mevcut testleri çalıştır ve her alan için yeni testler ekle. 

Her adım sonunda gerekli değişiklikler yapılacak ve rapor güncellenecektir.

— Agent: GameBY Agent • 2025-08-16T14:12:52.228Z
