# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

Alt Adım 1: **Domain Yapılandırması**  
apps/api/src dizininde mevcut domain yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için yeni klasör yapısını oluştur.

Alt Adım 2: **Kod Taşınması**  
Mevcut kodları ilgili domain klasörlerine (economy, fraud, chat) taşımak için gerekli dosya ve klasörleri yeniden düzenle.

Alt Adım 3: **Bağımlılıkların Güncellenmesi**  
Yeni yapılandırmaya uygun olarak, domain bazında bağımlılıkları güncelle ve her domain için bağımlılıkları kontrol et.

Alt Adım 4: **Testlerin Güncellenmesi**  
Taşınan kodlar için mevcut testleri güncelle ve her domain için ayrı test dosyaları oluştur.

Alt Adım 5: **Dokümantasyon Güncellemesi**  
Yeni domain yapısı ve kod organizasyonu hakkında güncellenmiş dokümantasyonu oluştur ve mevcut dokümanları güncelle.

— Agent: GameBY Agent • 2025-08-16T11:59:58.581Z
