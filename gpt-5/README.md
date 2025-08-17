# GPT-5 PowerShell Ops Agent (Windows → Linux SSH)

## 0) Gerekli
- Windows + PowerShell 7.x (pwsh)
- OpenAI API key: `OPENAI_API_KEY` (tek satır)
- Uzak sunucuda SSH açık (Ubuntu/Debian)
- Posh-SSH modülü (script otomatik kurar)

## 1) Çalıştırma
```powershell
cd .\gpt-5
$env:OPENAI_API_KEY="sk-..."; [Environment]::SetEnvironmentVariable('OPENAI_API_KEY',$env:OPENAI_API_KEY,'User')

# parser testi
.\gpt-ops.ps1 -SelfTest

# plan + DRY RUN
.\gpt-ops.ps1 -Goal "Nginx kur, /var/www/hello için site ayarla, 80/443 aç, nginx -t ve restart"
```

Kolay başlatıcı:
```powershell
cd .\gpt-5; ./run-agent.ps1 -Agent -DryRun -Goal "Nginx kur, /var/www/hello için site ayarla"
```

Sunucu içinden tetikleme (admin JWT ile):
- ENV: `AGENT_ENABLED=1` yapın.
- POST /api/ops/trigger body: `{ "goal": "..." }`

config.json → "DryRun": false yaptıktan sonra gerçek uygulama.
Model erişimi garanti etmek için önce "gpt-4o-mini", sonra "gpt-5" deneyin.

## 2) Güvenlik

Yıkıcı komutlar regex ile bloklanır (rm -rf, mkfs, userdel, reboot…)

params JSON şeması strict; modelin saçmalamasını engeller.

## 3) Sorun giderme

invalid_json_schema → şemadaki params.additionalProperties=false şart; bu repo zaten böyle.

unsupported_parameter → Responses API’de structured output text.format altındadır.

invalid_api_key → key'i tek satır gir, boşluk/CRLF temizle.


---

## 6) Son adım (Copilot)
- Dosyaları yazdıktan sonra **README.md**’yi aç, adımları terminalde uygula.  
- Herhangi bir hata alırsam **prompt’a geri dönmeden** ilgili dosyaya **otomatik düzeltme PR’ı** hazırla ve açıklamasında hatayı, çözümü ve yaptığın değişikliği yaz.

---

**Hepsi bu.**  
Bu prompt’u olduğu gibi uygula; `gpt-5/` klasörünü kur, dosyaları **tam içerikle** yaz, README’deki komutları ekle.
