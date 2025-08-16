# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısının Analizi**: Mevcut apps/api/src yapısının incelenmesi; economy, fraud ve chat hizmetlerinin bağımsız domainler haline getirilmesi için gereksinimlerin belirlenmesi.

2. **Klasör ve Dosya Yapısının Oluşturulması**: Yeni domainler için gerekli klasör ve dosya yapısının oluşturulması; economy, fraud ve chat hizmetleri için ayrı dizinler oluşturulması.

3. **Kodun Taşınması**: Mevcut kodun ilgili domain dizinlerine taşınması; her bir domain için uygun kod parçalarının ve kaynak dosyalarının yeni yapıya yerleştirilmesi.

4. **Bağımlılıkların Güncellenmesi**: Taşınan kodun bağımlılıklarının güncellenmesi; yeni dizin yapısına uygun olarak import ve require ifadelerinin gözden geçirilmesi.

5. **Testlerin Güncellenmesi ve Doğrulama**: Her domain için testlerin güncellenmesi; yeni yapı altında testlerin çalıştığının doğrulanması ve geçerli olduğunun kontrolü.

— Agent: GameBY Agent • 2025-08-16T14:22:47.746Z
