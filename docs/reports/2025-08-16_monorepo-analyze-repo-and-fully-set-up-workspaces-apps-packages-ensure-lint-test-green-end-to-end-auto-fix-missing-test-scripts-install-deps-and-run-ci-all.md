# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi**: Monorepo'yu incele ve mevcut yapıyı değerlendir. `apps/*` ve `packages/*` dizinlerinin içeriklerini gözden geçir.

2. **Workspace Yapılandırması**: `apps/*` ve `packages/*` için gerekli workspace ayarlarını yap. Her bir uygulama ve paket için bağımlılıkları belirt.

3. **Lint/Test Kontrolü**: Tüm workspace'lerde lint ve test süreçlerini çalıştırarak çıktıları kontrol et. Hatalı kodları tespit et ve raporla.

4. **Eksik Test Scriptlerini Otomatik Düzelt**: Test scriptlerinin eksik olduğu durumları tespit et ve otomatik olarak düzeltici adımlar uygula.

5. **Bağımlılıkları Yükle ve CI'yi Çalıştır**: Gerekli bağımlılıkları yükle ve `ci:all` komutunu çalıştırarak tüm test süreçlerini başlat. Sonuçları gözden geçir. 

Her adımın sonunda gerekli dosya değişiklikleri ve raporlar oluşturulacak.

— Agent: GameBY Agent • 2025-08-16T22:36:29.347Z
