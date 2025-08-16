# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analizi**: Mevcut apps/api/src klasöründeki hizmetlerin analizi yapılarak, hangi dosyaların economy, fraud ve chat servislerine ait olduğu belirlenir.

2. **Klasör Yapısının Oluşturulması**: Yeni domain yapısına uygun olarak economy, fraud ve chat klasörleri oluşturulur. Mevcut dosyalar bu yeni klasörlere taşınır.

3. **Bağımlılıkların Güncellenmesi**: Yeni klasör yapısına göre, uygulama içindeki bağımlılıkların güncellenmesi ve gerekli olan importların ayarlanması yapılır.

4. **Testlerin Güncellenmesi**: Taşınan dosyalarla ilgili mevcut testlerin güncellenmesi ve yeni domain yapısına uygun test senaryolarının oluşturulması sağlanır.

5. **Dokümantasyon Güncellemesi**: Yeni domain yapısını ve yapılan değişiklikleri açıklayan dokümantasyon güncellenerek, ekip üyelerinin bu değişikliklerden haberdar olması sağlanır.

— Agent: GameBY Agent • 2025-08-16T13:54:30.649Z
