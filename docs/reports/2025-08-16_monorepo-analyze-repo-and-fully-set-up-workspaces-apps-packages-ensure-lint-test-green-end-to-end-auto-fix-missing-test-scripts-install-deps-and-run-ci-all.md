# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Monorepo içerisindeki `apps/*` ve `packages/*` dizinlerini analiz et. Her bir uygulama ve paket için bağımlılıkları ve yapılandırmaları kontrol et.

2. **Workspace Ayarları**: `apps/*` ve `packages/*` için gerekli workspace ayarlarını yapılandır. Her bir uygulama ve paketin bağımlılıklarını uygun şekilde tanımla.

3. **Lint ve Test Kontrolü**: Projede mevcut olan lint ve test yapılandırmalarını kontrol et. Tüm kodun lint kurallarına uygun olup olmadığını ve testlerin başarılı bir şekilde geçip geçmediğini doğrula.

4. **Eksik Test Scriptlerini Düzeltme**: Eğer eksik test scriptleri varsa, otomatik olarak bu scriptleri oluştur ve gerekli dosyalara ekle.

5. **Bağımlılıkları Yükleme ve CI Çalıştırma**: Tüm bağımlılıkları yükle ve ardından `ci:all` komutunu çalıştırarak sürekli entegrasyon sürecini başlat. Tüm işlemlerin başarılı olduğundan emin ol.

— Agent: GameBY Agent • 2025-08-16T23:13:42.744Z
