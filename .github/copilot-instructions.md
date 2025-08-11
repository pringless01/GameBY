# GitHub Copilot / AI Agent Geliştirici Yönergeleri (Detaylı)

Bu proje: PWA (Vanilla JS) + Express / SQLite tabanlı sosyal ticaret & itibar oyunu.
Odak Alanları: Oyuncu odaklı ekonomi, güven (trust_score) meta oyunu, mentor (bot + gerçek) sistemi, sözleşme / potansiyel dolandırıcılık risk yönetimi.

---
## 1. Büyük Resim (Big Picture)
- frontend/: Mobil öncelikli (mobile-first) PWA; yalnızca statik servis + istemci etkileşimleri; ek framework (React/Vue) YOK (bilinçli sadelik kararı).
- server/: Oyun verisi + skor tabloları + güven/mentor mantığı; JSON REST API; ileride Socket.io real-time kanalına genişleyebilir.
- İş Kuralları Kaynağı: `Oyun_Proje_Dokumanlari/Ana_Oyun_Dokumani.md` → Core ekonomik / itibar mantığı eklemeden ÖNCE KONTROL ET.
- Veritabanı: SQLite (düşük operasyon maliyeti, tek dosya, hızlı prototipleme). Performans kritik yollar için LIMIT + sıralama + hafif indeks gereksinimi göz önünde tutulur.
- Ölçülebilirlik: Şu an bellek içi cache (Map + TTL) + basit sayaç metrikleri → Prometheus formatı ile dış izleme entegrasyonu.

---
## 2. Backend Modüler Yapı
| Bölüm | Amaç | Ana Dosyalar |
|-------|------|--------------|
| Routes | API uçları (profil, leaderboard, metrics, bootstrap) | `routes/user.js` |
| Security | Cursor imzalama, rotation, abuse (threshold + cooldown) | `security/cursorSecurity.js` |
| Cache | TTL’li bellek map’leri (trust, mentor, around, daily) | `cache/trustCaches.js`, `cache/mentorCaches.js` |
| Metrics | Sayaç objesi + export | `metrics/leaderboardMetrics.js` |
| Middleware | Auth (JWT), rate limit (LB) | `middleware/auth.js`, `middleware/rateLimit.js` (varsa) |
| Services | Kullanıcı & mentor sorguları / güncellemeler | `services/userService.js`, `services/mentorService.js` |
| Utils | ETag hesaplama, yardımcı fonksiyonlar | `utils/etag.js` |

Not: Kod okunabilirliği için “tek sorumluluk” korunur; header / metric isimleri TEKRAR EDİLMEZ ya da değiştirilmez.

---
## 3. Leaderboard (Çekirdek Özellik)
### Modlar
1. offset (klasik pagination)  
2. cursor (HMAC-SHA256 imzalı; stabil, leak’e dayanıklı)  
3. around (kullanıcı rank merkezli pencere: rank-window .. rank+window)  
4. batch (categories=trust,mentor bir arada)

### Cursor Güvenliği
- encodeCursor(score,id) → base64(payload|signature).  
- decodeCursor() → rotation desteği: Hem `CURSOR_SECRET` hem `CURSOR_SECRET_ROTATION` test edilir; rotation yakalanırsa `X-Cursor-Rotation` header.  
- Weak secret kontrolü (çok kısa secret) → `X-Cursor-Weak-Secret`.  

### Abuse / Degrade Mantığı
- IP bazlı invalid cursor sayacı: invalid decode → metrics.errors.invalidCursor ++
- Eşik: `count > INVALID_CURSOR_THRESHOLD` (strict >, asla >=).  
- Cooldown: `CURSOR_ABUSE_COOLDOWN_MS` boyunca cursor istekleri degrade edilmek istenebilir; ilk OFFSET isteği grace (200) + `X-Cursor-Abuse` header’ları.  
- Auto-degrade: Sadece (a) `CURSOR_AUTO_DEGRADE=1` ve (b) eşik SONRASI yeni invalid cursor olduğunda tetiklenir; cursor → offset fallback + `X-Cursor-Auto-Degrade=1`.  
- 429: Cooldown içinde tekrarlayan offset dışı veya grace harcanmış talepler.

### Header Konvansiyonu (DEĞİŞTİRME)  
- Pagination: `X-Pagination-Mode`, `X-Next-Cursor`, `X-Has-More`, `X-Total-Count`  
- Kullanıcı Rank: `X-User-Rank`, `X-User-Percentile`, `X-User-Rank-Skipped`  
- Cursor Güvenlik: `X-Cursor-Abuse`, `X-Cursor-Abuse-Count`, `X-Cursor-Cooldown`, `X-Cursor-Degrade`, `X-Cursor-Auto-Degrade`, `X-Cursor-Rotation`, `X-Cursor-Weak-Secret`, `X-Cursor-Signed`  
- Cache: `X-Cache` (HIT|MISS), `X-Cache-TTL`  
- Batch: `X-Batch-Categories`, `X-Batch-Cache`, `X-Batch-Min-TTL`  
- Diğer: `Server-Timing`, ETag / Last-Modified.  

### Uygulama Deseni
- Tüm abuse / degrade header set’leri: `applyAbuseHeaders(req,res)` (tek giriş noktası).  
- Rank isteğe bağlı: query param `rank=0` ise hesaplanmaz → `X-User-Rank-Skipped` + metrics.rank.skipped ++.  
- around modunda rank zorunlu (otomatik).  

---
## 4. Cache Politikası
| Cache | Amaç | TTL Kaynağı | HIT/MISS Header | Anahtar Yapısı |
|-------|------|-------------|-----------------|----------------|
| leaderboardCache | trust offset sayfaları | LEADERBOARD_TTL_MS | Evet | `${limit}:${offset}` |
| trustAroundCache | around pencere (rank etrafı) | LEADERBOARD_TTL_MS | Evet | `${userId}:${window}` |
| mentorsLbCache | mentor LB (liste) | MENTOR_LB_TTL_MS | Evet | `${limit}:${minSessions}` |
| mentorsRankCache | mentor self-rank aggregate | MENTOR_LB_TTL_MS | Dolaylı (selfRank.ttl_ms) | `${minSessions}` |
| dailyTrustCache | günlük kazanılan trust | DAILY_TRUST_TTL_MS | Evet | `${userId}` |
| trustTrendCache | 7 günlük trend | TRUST_TREND_TTL_MS | Dolaylı | `${userId}:7` |

Kural: Cache MISS → kaydedip TTL header; HIT → kalan süre TTL header’da.

---
## 5. Metrikler (leaderboardMetrics)
Gruplar:
- trust.offset.{hits,misses}
- trust.cursor.{requests,rotations}
- trust.around.requests
- mentor.{hits,misses}
- rank.{computed,skipped}
- errors.invalidCursor
- security.{cursorAbuse429,modeDegradeSuggested,cursorAutoDegrade,cooldownGraceServed}

Export Uçları:
- JSON: `GET /api/user/leaderboard/metrics` (admin role)  
- Prometheus: `GET /api/user/leaderboard/metrics/prom` (text/plain; v0.0.4)  

Yeni sayaç eklerken: Aynı isimlendirme stilini (snake, hiyerarşik) koru; Prometheus endpoint’e TYPE satırı ekle; test ekle (format & artış).

---
## 6. Test & Çalıştırma
Komutlar:
```
cd server
npm install
npm run start
npm run test:unit:cursor-security
npm run test:integration:leaderboard-metrics
npm run test:integration:leaderboard-prom
```
Frontend:
```
cd frontend && node simple-server.js    # 8080
```
Test Odakları:
- cursorSecurity: imza, rotation, threshold, cooldown.
- leaderboard: abuse, auto-degrade, grace, param validation, Prometheus format.

Yeni test eklerken: Başarılı senaryoya ek olarak negative param & abuse edge case kapsa.

---
## 7. Ortam Değişkenleri
| Değişken | Amaç |
|----------|------|
| JWT_SECRET | JWT doğrulama (güçlü üretim secret) |
| CURSOR_SECRET | Cursor imzalama ana secret |
| CURSOR_SECRET_ROTATION | Opsiyonel eski/rotate secret |
| CURSOR_INVALID_THRESHOLD | Invalid cursor abuse eşiği (strict >) |
| CURSOR_ABUSE_COOLDOWN_MS | Cooldown süresi (ms) |
| CURSOR_AUTO_DEGRADE | 1 → eşik sonrası invalid cursor’da degrade |
| LB_RATE_WINDOW_MS | /leaderboard rate limit pencere |
| LB_RATE_MAX | Pencere başına izin verilen istek |

Not: Değerler değiştiğinde testlerde ıraksama olabilir; testleri güncelle.

---
## 8. Genişletme Rehberi
Senaryo: Yeni “guild leaderboard” eklemek istiyorsun.
1. Cache: Map + { ts } + TTL (örn: GUILD_LB_TTL_MS).  
2. Sorgu: LIMIT / OFFSET / optional cursor (aynı pattern).  
3. Header: Aynı X-* şeması + kategori ismini batch moduna ekle.  
4. Metrics: guild.offset.{hits,misses} & guild.cursor.requests vb. (gerekliyse).  
5. Abuse: Cursor kullanıyorsa decodeCursor → INVALID → increment + degrade pattern.  
6. Test: offset hit/miss, cursor rotation, invalid→400, cooldown grace, Prometheus satırları.

---
## 9. Kodlama Konvansiyonları
- Threshold karşılaştırmaları: her zaman `>` (asla `>=`).
- Header isimleri sabit; varyasyon eklemeyin (geriye dönük uyum). 
- Fonksiyon isimleri camelCase; metrics alanları snake_case varyasyonunu dış exportta koruyor.
- ETag: Response body (JSON.stringify) üzerinden build; değişmeyen veri için 304 optimize.
- Server-Timing: Yalnızca toplam süre (`total;dur=xx.xx`).
- Hata JSON formatı: `{ error: 'kod' }` + gerekiyorsa `fields` dizisi.

---
## 10. Güvenlik Notları
- JWT geliştirme secret’ı zayıf → üretimde ENV ile güçlendir.
- Cursor manipülasyonu → invalid decode → metrik artır, degrade değerlendirmesi.
- Rotation: Eski secret devreden çıktığında metrik (rotations) izlenebilir; kalıcı değilse kodu kaldırma, env boş geç.
- IP bazlı abuselar memory haritasında tutuluyor; ileride LRU / TTL prune gerekebilir (şimdilik düşük ölçek varsayımı). 

---
## 11. Performans & Ölçeklenebilirlik
- Ranking hesaplaması: userRankMeta için COUNT(*) > trust_score sorgusu (O(N) index yoksa). Gerekirse `CREATE INDEX idx_users_trust_score ON users(trust_score DESC)` ileride eklenebilir.
- Around modunda: ROW_NUMBER window fallback (SQLite versiyon farkına tolerans için try/catch + manuel sıralama fallback).
- Cache TTL değerlerini gereksiz azaltma (fazla invalidation → DB baskısı). 

---
## 12. Sık Yapılan Hatalar / Anti-Patternler
| Hata | Sonuç | Doğrusu |
|------|-------|---------|
| >= kullanımı (threshold) | Erken degrade | `if (cnt > INVALID_CURSOR_THRESHOLD)` |
| Header ismi değiştirme | Test kırılması | Mevcut isimleri koru |
| Cache TTL atlaması | Yanlış X-Cache-TTL | TTL hesapla & header set |
| applyAbuseHeaders atlaması | Tutarsız abuse header | Her yeni cursor endpoint’te çağır |
| Yeni metric endpoint’e TYPE eklememe | Prom format uyumsuz | `# TYPE name counter|gauge` ekle |
| Cursor error sonrası degrade etmemek | Tekrar invalid spam | count > threshold & AUTO_DEGRADE kontrol et |

---
## 13. Örnek İstekler (Hızlı Referans)
```
GET /api/user/leaderboard?limit=10&offset=0
GET /api/user/leaderboard?cursor=ENC...&limit=10
GET /api/user/leaderboard?around=1&window=2
GET /api/user/leaderboard?categories=trust,mentor&limit=5
GET /api/user/leaderboard/metrics (admin JWT)
GET /api/user/leaderboard/metrics/prom (admin JWT)
```
Yanıt header’ları üzerinden mod, degrade, abuse, cache tutarlılığını doğrula.

---
## 14. Geliştirme Durumu (Güncel)
- Leaderboard offset/cursor/around + batch stabil.
- Cursor güvenlik: rotation, weak secret, abuse threshold, cooldown, grace, auto-degrade uygulanmış.
- Prometheus format testleri geçiyor.
- Param validation & metrics snapshot testleri mevcut.
- İyileştirme fırsatı: `applyAbuseHeaders` sadeleştirme (double degrade guard), helper: `shouldAutoDegrade(count)`.

---
## 15. Yeni Katkı İçin Check-List
1. İlgili dokümanı (Ana_Oyun_Dokumani) oku.  
2. Endpoint taslağı → header & metric gereksinimlerini haritala.  
3. Cache gerekip gerekmediğine karar ver (TTL & anahtar tasarla).  
4. Abuse / cursor gerekiyorsa decodeCursor + invalid path testleri ekle.  
5. Prometheus endpoint satırları güncelle (TYPE + metric).  
6. Test: başarı, hata, threshold sınırı, cooldown grace, degrade.  
7. ETag / Last-Modified entegrasyonu (değişken veri).  
8. Kod incele: threshold strict >, header isimleri, X-Cache-TTL doğru mu?  

---
## 16. Soru / Eksik Durumlar
Bu dokümanda eksik gördüğün başlık, yeni kategori ya da ölçeklenme gereksinimi varsa PR öncesi kısa not ekle (örn: `// TODO(metrics): guild.* counters`).

---
Bu yönerge keşfedilebilir mevcut durumu yansıtır; spekülatif / geleceğe dönük kurallar eklenmez. Aynı desenleri takip ederek katkı yap.
