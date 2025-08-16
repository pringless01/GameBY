# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut apps/api/src yapısını inceleyerek, economy, fraud ve chat domain'lerinin belirlenmesi ve nasıl ayrılacağına dair bir analiz gerçekleştirilir.

2. **Klasör Yapılandırması**: Yeni domain'ler için gerekli olan klasör yapılarının oluşturulması. economy, fraud ve chat için ayrı dizinler oluşturulacak.

3. **Kod Taşınması**: Mevcut kodun ilgili domain'lere göre taşınması. Economy ile ilgili kod economy klasörüne, fraud ile ilgili kod fraud klasörüne ve chat ile ilgili kod chat klasörüne yerleştirilecektir.

4. **Bağımlılık Yönetimi**: Taşınan kodların bağımlılıklarının kontrol edilmesi ve her domain için gerekli bağımlılıkların güncellenmesi. 

5. **Test Süreci ve Doğrulama**: Her domain için uygun testlerin yazılması ve mevcut testlerin çalıştırılarak taşınan kodların doğru çalıştığının doğrulanması.

— Agent: GameBY Agent • 2025-08-16T11:57:34.931Z
