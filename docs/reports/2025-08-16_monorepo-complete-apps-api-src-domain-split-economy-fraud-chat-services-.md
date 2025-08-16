# Next Action: Monorepo: Complete apps/api/src domain split (economy/fraud/chat services)

1. **Domain Yapısını Analiz Et**: Mevcut `apps/api/src` dizinindeki dosya ve klasör yapısını inceleyerek, ekonomi, dolandırıcılık ve sohbet hizmetleri için gereken domain yapısını belirle.

2. **Yeni Dizini Oluştur**: `apps/api/src` altında `economy`, `fraud`, ve `chat` adında üç yeni dizin oluştur. Her dizin, ilgili hizmetlerin kaynak dosyalarını bulunduracak.

3. **Dosyaları Taşı**: Mevcut dosyaları uygun dizinlere taşı. Ekonomi ile ilgili dosyaları `economy`, dolandırıcılık ile ilgili olanları `fraud`, sohbet ile ilgili olanları ise `chat` dizinine yerleştir.

4. **Yapılandırma Dosyalarını Güncelle**: Her yeni dizin için gerekli yapılandırma dosyalarını (`package.json`, `tsconfig.json`, vb.) oluştur ve güncelle. Ayrıca, projenin genel yapılandırma dosyalarında bu yeni dizinlerin referanslarını ekle.

5. **Test ve Doğrulama**: Yeni dizin yapısı altında tüm testlerin çalıştığından emin ol. Gerekirse testleri güncelle ve başarılı bir şekilde geçtiğini doğrula.

— Agent: GameBY Agent • 2025-08-16T13:52:16.756Z
