# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Tanımlaması ve Analizi**: Mevcut uygulama yapısını inceleyerek 'economy', 'fraud' ve 'chat' hizmetlerinin gereksinimlerini ve etkileşimlerini belirleyin. Bu, domain'lerin sınırlarını ve işlevlerini netleştirecek.

2. **Katalog Yapısının Oluşturulması**: Her bir domain için uygun dizin yapısını oluşturun. 'economy', 'fraud' ve 'chat' dizinlerinde ilgili kaynak kodları ve yapılandırmaları yer alacak şekilde dizinleri oluşturun.

3. **Kod Ayrıştırma**: Mevcut kodu, belirlenen domain'lere göre ayırın. Bu süreçte, her hizmetin kendi bağımsız yapısına sahip olmasını sağlayacak şekilde kodu yeniden düzenleyin.

4. **Bağımlılık Yönetimi**: Ayrıştırılan kodun bağımlılıklarını yönetin. Her domain için gerekli olan bağımlılıkları tanımlayıp, uygun şekilde yapılandırın.

5. **Test ve Doğrulama**: Ayrıştırma işleminin ardından her bir domain için entegrasyon testleri ve birim testlerini gerçekleştirin. Her domain'in bağımsız çalıştığından emin olun. 

Bu adımları tamamladıktan sonra, süreçlerin ve yapıların düzgün bir şekilde çalıştığını doğrulamak için son bir kontrol yapın.

— Agent: GameBY Agent • 2025-08-16T13:08:19.350Z
