# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Mevcut apps/api/src yapısını incele ve domain'leri belirle (economy, fraud, chat services). 

2. **Directory Structure Creation**: Yeni domain'ler için gerekli dizin yapısını oluştur ve uygun dosya yerleşimlerini planla.

3. **Service Code Refactoring**: Her domain için mevcut kodları refactor et; ilgili servisleri ayrı dosyalara taşı.

4. **Dependency Management**: Domain'ler arası bağımlılıkları gözden geçir ve gerekli güncellemeleri yaparak bağımlılıkları yönet.

5. **Testing and Validation**: Her domain için birim testleri yaz ve mevcut testleri çalıştırarak tüm sistemin düzgün çalıştığını doğrula. 

Her adımda dosya ve commit değişiklikleri yapılacak, lint=0 ve test=PASS olacak şekilde ilerleyeceğim.

— Agent: GameBY Agent • 2025-08-16T12:05:02.422Z
