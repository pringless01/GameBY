# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Split Planı Oluşturma**: Uygulama için ekonomi, dolandırıcılık ve sohbet hizmetleri alanlarının net bir şekilde tanımlanması ve her bir alan için gerekli değişikliklerin belirlenmesi.

2. **Kod Yapısını Gözden Geçirme**: Mevcut kod yapısının incelenmesi ve alan bazında dosya ve dizin yapısının nasıl düzenleneceğinin belirlenmesi.

3. **Alan Bazında Kod Refaktörizasyonu**: Belirlenen alanlara göre kodun refaktör edilmesi, dosyaların uygun dizinlere taşınması ve gerekli bağımlılıkların güncellenmesi.

4. **Testlerin Güncellenmesi**: Yeni alan yapısına uygun olarak mevcut testlerin güncellenmesi ve her alan için yeni testlerin yazılması.

5. **Entegrasyon ve Dağıtım**: Split işleminin ardından tüm alanların entegrasyon testlerinin yapılması ve monorepo yapılandırmasının güncellenerek dağıtım işleminin gerçekleştirilmesi.

— Agent: GameBY Agent • 2025-08-16T14:09:18.867Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T14:09:48.048Z
- reason: Command failed: npm test
