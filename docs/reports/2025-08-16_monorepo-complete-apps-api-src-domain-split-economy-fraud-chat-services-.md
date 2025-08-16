# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Ekonomi Servisi Ayırma**: apps/api/src içerisinde yer alan ekonomi ile ilgili kod ve bileşenleri, ayrı bir ekonomi servisine taşıyın. Bu işlem, mevcut kodun analizi ve yeni dizin yapısının oluşturulmasını içerir.

2. **Dolandırıcılık Servisi Ayırma**: Dolandırıcılık ile ilgili kod ve bileşenleri, uygun dizin yapısına yerleştirerek ayrı bir dolandırıcılık servisi oluşturun. Bu, ilgili dosyaların taşınması ve bağımlılıkların güncellenmesini gerektirir.

3. **Sohbet Servisi Ayırma**: Sohbet ile ilgili kod ve bileşenleri ayrı bir sohbet servisine taşıyın. Bu adım, sohbet servisinin işlevselliğini koruma ve yeni dizin yapısını oluşturmayı içerir.

4. **Bağımlılıkları Güncelleme**: Her bir yeni servis için gerekli bağımlılıkları güncelleyin ve her bir servisin düzgün çalıştığından emin olun. Bu, kodun entegrasyonunu ve uyumluluğunu sağlamak için önemlidir.

5. **Test ve Doğrulama**: Taşınan her bir servisin işlevselliğini test edin. Tüm servislerin beklendiği gibi çalıştığından emin olun ve gerekirse düzeltmeler yapın. 

Bu adımlar, monorepo içerisindeki uygulama kodlarının düzgün bir şekilde ayrıştırılmasını sağlayacaktır.

— Agent: GameBY Agent • 2025-08-16T13:09:53.128Z
