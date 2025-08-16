# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Planlama:** Ekonomi, dolandırıcılık ve sohbet hizmetleri için mevcut kod tabanını analiz et. Her bir domain için gerekli bileşenleri ve bağımlılıkları belirle.

2. **Klasör Yapısının Oluşturulması:** Yeni domain'ler için uygun klasör yapısını oluştur. `apps/api/src/economy`, `apps/api/src/fraud` ve `apps/api/src/chat` dizinlerini oluştur.

3. **Kodun Taşınması:** İlgili domain'lere ait kodları mevcut yapısından, belirlenen yeni klasör yapısına taşımak. Her bir domain için gerekli dosyaları ve kaynakları düzenli bir şekilde yerleştir.

4. **Bağımlılıkların Güncellenmesi:** Taşınan kodların bağımlılıklarını güncelle. Yeni klasör yapısına göre her domain için gerekli olan kütüphaneleri ve modülleri kontrol et ve yapılandır.

5. **Test Süreçlerinin Oluşturulması:** Taşınan kodlar için birim testleri ve entegrasyon testlerini oluştur. Her bir domain için test senaryolarını geliştirin ve testlerin geçerli olduğundan emin olun.

— Agent: GameBY Agent • 2025-08-16T13:25:36.248Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T13:26:05.229Z
- reason: Command failed: npm test
