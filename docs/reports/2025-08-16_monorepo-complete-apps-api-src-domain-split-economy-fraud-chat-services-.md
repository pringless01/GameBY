# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Uygulamanın mevcut yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetlerinin hangi bileşenleri içerdiğini belirleyin. Bu analiz, her bir alanın bağımsız olarak nasıl çalıştığını anlamak için gereklidir.

2. **Klasör Yapısı Oluşturma**: Yeni domain'ler için uygun klasör yapısını oluşturun. `apps/api/src/economy`, `apps/api/src/fraud`, ve `apps/api/src/chat` gibi klasörler oluşturulacak.

3. **Kod Taşınması**: Her bir domain'e ait kod bileşenlerini mevcut yapıdan yeni oluşturulan klasörlere taşıyın. Bu, ilgili dosyaların doğru yere yerleştirilmesini sağlar.

4. **Bağımlılık Yönetimi**: Yeni domain'ler arasındaki bağımlılıkları gözden geçirin ve gerekli olanları ayarlayın. Her bir domain'in kendi bağımsızlığını koruması için bağımlılıkların analizi önemlidir.

5. **Testlerin Güncellenmesi**: Taşınan kodlarla birlikte test dosyalarını da güncelleyin. Her bir domain için uygun testlerin çalıştığını doğrulamak amacıyla gerekli test senaryolarını oluşturun ve çalıştırın.

— Agent: GameBY Agent • 2025-08-16T14:17:20.793Z
