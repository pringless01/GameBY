@echo off
:: Agent Runner Hızlı Durum Kontrol
:: Kullanım: agent-status.bat

echo.
echo 🤖 Agent Runner Status - %time%
echo ================================
echo.

:: Runner çalışıyor mu?
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find /I "node.exe" >nul
if %ERRORLEVEL%==0 (
    echo ✅ Runner ÇALIŞIYOR
) else (
    echo ❌ Runner ÇALIŞMIYOR
)

:: Son commit ne zaman?
echo.
echo 📝 Son Commit:
git log -1 --pretty=format:"  %%s (%%cr)" 2>nul || echo   Git repository bulunamadı

:: Kaç görev tamamlandı?
echo.
echo ✅ Görev İlerlemesi:
findstr /C:"\"done\": true" tools\tasks.json >nul 2>&1
if %ERRORLEVEL%==0 (
    for /f %%i in ('findstr /C:"\"done\": true" tools\tasks.json ^| find /C /V ""') do set done=%%i
    for /f %%i in ('findstr /C:"\"id\":" tools\tasks.json ^| find /C /V ""') do set total=%%i
    echo   !done! / !total! görev tamamlandı
) else (
    echo   Görev bilgisi okunamadı
)

:: Son log satırları
echo.
echo 📜 Son Log (5 satır):
if exist logs\runner.log (
    powershell "Get-Content logs\runner.log -Tail 5 | ForEach-Object { '  ' + $_ }"
) else (
    echo   Log dosyası bulunamadı
)

echo.
pause
