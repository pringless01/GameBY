# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi ve Belirleme**
   - Ekonomi, dolandırıcılık ve sohbet hizmetlerinin gereksinimlerini belirleyin. Her bir hizmetin sorumluluklarını ve etkileşimlerini analiz edin.

2. **Klasör Yapısının Oluşturulması**
   - Uygulama dizininde, her bir hizmet için ayrı klasörler oluşturun: `economy`, `fraud`, `chat`. Bu klasörler altında gerekli dosya ve alt klasör yapısını tanımlayın.

3. **Hizmetlerin Kod Yapısının Ayrılması**
   - Mevcut kod tabanından ilgili hizmetlerin kodunu ayırarak yeni oluşturulan klasörlere taşıyın. Her bir hizmetin bağımsız birimler olarak çalışmasını sağlamak için gerekli değişiklikleri yapın.

4. **Bağımlılıkların Yönetimi**
   - Her bir hizmetin bağımlılıklarını güncelleyin. Gerekli kütüphaneleri ve modülleri her hizmetin özel dizininde yönetin.

5. **Test ve Doğrulama**
   - Ayrılan hizmetler için test senaryoları oluşturun ve mevcut testleri güncelleyerek her bir hizmetin bağımsız olarak doğru çalıştığını doğrulayın. Testlerin geçerli olduğunu kontrol edin.

— Agent: GameBY Agent • 2025-08-16T14:24:42.256Z
