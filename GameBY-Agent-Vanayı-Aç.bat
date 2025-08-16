@echo off
setlocal

echo ==============================================
echo   GameBY Agent Yanayı Açma İşlemi (Kod Odaklı)
echo ==============================================
echo.

echo 1. Agent durmunu kontrol ediyorum...
tasklist /fi "windowtitle eq GameBY Agent" >nul 2>&1
if %errorlevel% EQU 0 (
    echo    ✅ Agent şu anda çalışıyor - yeniden başlatılacak
    taskkill /f /fi "windowtitle eq GameBY Agent" >nul 2>&1
    timeout /t 3 >nul
) else (
    echo    ❌ Agent çalışmıyor - başlatılacak
)

echo.
echo 2. Task odağı değiştiriliyor (DOCS -^> CODE)...
cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

echo    Status dosyası güncellendi - Agent artık sadece kod üzerinde çalışacak
echo    ⚠️  DÖKÜMANTABİYON GÖREVLERİ YASAKLANDI
echo.

echo 3. Agent başlatılıyor (yeni görev odağı ile)...
start "GameBY Agent" powershell -NoExit -Command "cd 'C:\Users\Musa\Documents\GitHub\GameBY' ; node tools/agent-runner/runner.js"

timeout /t 5 >nul

echo.
echo 4. Durum kontrol ediliyor...
tasklist /fi "windowtitle eq GameBY Agent" >nul 2>&1
if %errorlevel% EQU 0 (
    echo    ✅ Agent başarıyla yeniden başlatıldı
    echo    📊 Gerçek zamanlı izleme için: GameBY-Agent-Status-Simple.bat
) else (
    echo    ❌ Agent başlatılamadı - manuel başlatma gerekebilir
)

echo.
echo ==============================================
echo   AGENT YENİ ODAK: GERÇEK KOD GELİŞTİRME
echo ==============================================
echo   • Backend API endpoints (marketplace, contracts, preferences)
echo   • Frontend PWA UI components (chat, listing management)  
echo   • Performance optimizations (SQL indexes, caching)
echo   • Real-time features (WebSocket integration)
echo.
echo   ❌ YASAKLANAN: Tüm dokümantasyon görevleri
echo   ⏰ Token tasarrufu: Sadece kod değişiklikleri
echo.

pause
