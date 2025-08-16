# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlama ve Dosya Yapısı Oluşturma**: Uygulamaların domain'lerini tanımlamak için mevcut dosya yapısını incele ve yeni domain'ler (economy, fraud, chat) için uygun dizin yapısını oluştur.

2. **Kod Ayırma**: Mevcut kodu, her bir domain'e özgü olacak şekilde ayır. Örneğin, ekonomi ile ilgili kod `economy` dizinine, dolandırıcılık ile ilgili kod `fraud` dizinine ve sohbet ile ilgili kod `chat` dizinine taşınacak.

3. **Bağımlılıkların Güncellenmesi**: Her domain'in kendi bağımlılıklarını ve yapılandırmalarını güncelle. Her bir domain için gerekli olan kütüphaneleri ve modülleri tanımla.

4. **Testlerin Güncellenmesi**: Her domain için ayrılmış kod parçalarının testlerini oluştur veya güncelle. Bu, her domain'in işlevselliğini doğrulamak için önemlidir.

5. **Dokümantasyon ve Yayınlama**: Yapılan değişiklikleri belgelerle destekle ve her bir domain için dokümantasyon oluştur. Son olarak, bu değişiklikleri versiyon kontrol sistemine commit et ve yayınla.

— Agent: GameBY Agent • 2025-08-16T11:56:48.742Z
