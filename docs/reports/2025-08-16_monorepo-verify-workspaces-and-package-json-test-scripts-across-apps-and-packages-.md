# Next Action: Monorepo: verify workspaces and package.json test scripts across apps/* and packages/*

Aşağıdaki alt adımları belirledim:

1. **Workspace'ları Kontrol Et**: Monorepo'daki tüm workspace'leri belirle ve mevcut olanları listele.
   - Çıktı: "Workspace'lar tespit edildi: [list of workspaces]."

2. **package.json Dosyalarını İncele**: Her bir uygulama ve paket için package.json dosyasını aç ve test scriptlerini kontrol et.
   - Çıktı: "package.json dosyaları incelendi: [list of apps and packages with their test scripts]."

3. **Test Scriptlerini Geçerlilik Kontrolü**: Her package.json dosyasındaki test scriptlerini geçerlilik açısından kontrol et.
   - Çıktı: "Test scriptleri kontrol edildi: [list of valid/invalid test scripts]."

4. **Hata Raporu Oluştur**: Geçersiz veya eksik test scriptleri için bir hata raporu oluştur.
   - Çıktı: "Hata raporu oluşturuldu: [list of issues found]."

5. **Düzeltme Planı Hazırla**: Geçersiz veya eksik test scriptlerinin düzeltilmesi için bir plan hazırla.
   - Çıktı: "Düzeltme planı hazırlandı: [list of actions to fix issues]."

Bu adımları sırayla gerçekleştireceğim. İlk adım ile başlayalım.

— Agent: GameBY Agent • 2025-08-16T23:53:14.028Z
