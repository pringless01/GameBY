# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Uygulamanın mevcut yapısını ve domain'leri analiz et. Hangi bileşenlerin economy, fraud ve chat hizmetlerine ait olduğunu belirle.

2. **Folder Structure Creation**: Yeni domain'ler için gerekli klasör yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud`, `apps/api/src/chat` dizinlerini oluştur.

3. **Code Refactoring**: Mevcut kodu uygun domain klasörlerine taşı. Her bir bileşeni, ilgili domain klasörüne yerleştir.

4. **Update Imports and Exports**: Taşınan kodlar için import ve export ifadelerini güncelle. Yeni yapı ile uyumlu hale getir.

5. **Testing and Validation**: Her domain için test senaryolarını oluştur ve mevcut testleri çalıştırarak yeni yapının işlevselliğini doğrula. 

Her adım için gerekli değişiklikler yapılacak ve rapor güncellenecek.

— Agent: GameBY Agent • 2025-08-16T13:48:37.471Z
