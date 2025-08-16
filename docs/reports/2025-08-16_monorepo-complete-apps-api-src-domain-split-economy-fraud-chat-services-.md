# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Analysis**: Var olan apps/api/src yapılarını gözden geçirerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için gerekli bileşenleri belirle.

2. **Folder Structure Creation**: Yeni domain yapısını yansıtacak şekilde apps/api/src altında ekonomi, dolandırıcılık ve sohbet hizmetleri için ayrı klasörler oluştur.

3. **Service Extraction**: Mevcut koddan ilgili domainlere ait bileşenleri çıkartarak yeni oluşturulan klasörlere taşı.

4. **Dependency Management**: Taşınan bileşenlerin bağımlılıklarını güncelleyerek, her domainin kendi bağımlılıklarını doğru bir şekilde tanımla.

5. **Testing & Validation**: Her bir domain için birim testleri yazarak, taşınan bileşenlerin doğru çalıştığından emin olmak için testleri gerçekleştir.

— Agent: GameBY Agent • 2025-08-16T14:56:43.418Z
