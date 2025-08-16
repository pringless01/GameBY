# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Uygulamanın mevcut yapısını incele, ekonomi, dolandırıcılık ve sohbet servisleri için gerekli olan bileşenleri belirle.

2. **Klasör Yapısı Oluşturma**: Yeni domainler için klasör yapısını oluştur; `apps/api/src/economy`, `apps/api/src/fraud`, `apps/api/src/chat` şeklinde dizinleri ayır.

3. **Kod Dağıtımı**: Mevcut kodu uygun domain dizinlerine taşı; her servisin ilgili kodları doğru klasörlere yerleştir.

4. **Bağımlılık Yönetimi**: Taşınan kodların bağımlılıklarını kontrol et ve her domain için gerekli bağımlılıkları güncelle veya ekle.

5. **Test ve Doğrulama**: Her domain için test senaryolarını oluştur ve çalıştır; tüm testlerin başarılı olduğundan emin ol. 

Bu adımlar tamamlandıktan sonra, projenin domain bölümü tamamlanmış olacaktır.

— Agent: GameBY Agent • 2025-08-16T14:24:58.010Z
