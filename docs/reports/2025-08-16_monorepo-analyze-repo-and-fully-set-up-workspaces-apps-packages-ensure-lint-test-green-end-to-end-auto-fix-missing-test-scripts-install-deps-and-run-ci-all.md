# Next Action: Monorepo: Analyze repo and fully set up workspaces (apps/*, packages/*), ensure lint/test green end-to-end; auto-fix missing test scripts; install deps and run ci:all

1. **Repo Analizi:** Monorepo içerisindeki `apps/*` ve `packages/*` dizinlerini analiz et ve mevcut dosya yapısını incele.

2. **Workspace Kurulumu:** `apps/*` ve `packages/*` dizinlerinde gerekli workspace yapılandırmalarını oluştur ve her birinin bağımlılıklarını tanımla.

3. **Lint ve Test Kontrolü:** Tüm kodun lint doğrulamasını gerçekleştir ve testlerin başarıyla geçtiğinden emin ol.

4. **Eksik Test Scriptlerini Düzelt:** Mevcut test scriptlerini kontrol et, eksik olanları otomatik olarak ekle veya düzelt.

5. **Bağımlılıkları Yükle ve CI'yi Çalıştır:** Tüm bağımlılıkları yükle ve `ci:all` komutunu çalıştırarak sürekli entegrasyon süreçlerini başlat. 

Her adımda gerçek değişiklikler yapılacak ve sonuçlar raporlanacak.

— Agent: GameBY Agent • 2025-08-16T22:15:13.692Z


## Fail checkpoint (attempt 1)
- time: 2025-08-16T22:15:17.692Z
- reason: Command failed: npm run lint
