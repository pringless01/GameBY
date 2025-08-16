# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını İnceleme:** apps/api/src dizinindeki mevcut yapı incelenecek ve domain split için uygun olan economy, fraud ve chat servisleri belirlenecek.

2. **Yeni Dizin Oluşturma:** Belirlenen domainler için yeni dizin yapıları oluşturulacak. economy, fraud ve chat için uygun dizinler oluşturulacak.

3. **Kodun Taşınması:** Mevcut kod yapısından ilgili servislere ait dosyalar, belirlenen yeni dizinlere taşınacak. Bu aşamada kodun düzgün bir şekilde ayrıldığından emin olunacak.

4. **Bağlantıların Güncellenmesi:** Taşınan dosyaların içindeki import ve export bağlantıları, yeni dizin yapısı ile uyumlu hale getirilecek.

5. **Testlerin Güncellenmesi ve Çalıştırılması:** Yeni dizin yapısına göre test dosyaları güncellenecek ve tüm testlerin başarıyla geçtiğinden emin olunacak.

— Agent: GameBY Agent • 2025-08-16T13:44:11.738Z
