@echo off
title GameBY Agent Runner - Otomatik Calisma ve Log Takip
color 0A
chcp 65001 >nul

echo.
echo ===================================================
echo    GameBY Agent Runner - Otomatik Baslama
echo ===================================================
echo.

:: Ana dizine git
cd /d "C:\Users\Musa\Documents\GitHub\GameBY"
echo [%TIME%] Dizin: %CD%

:: Lock dosyalarini temizle
echo [%TIME%] Lock dosyalari temizleniyor...
if exist "agent\STOP" del /f /q "agent\STOP" >nul 2>&1
if exist "agent\agent.lock" del /f /q "agent\agent.lock" >nul 2>&1
if exist "tools\agent-runner\agent.lock" del /f /q "tools\agent-runner\agent.lock" >nul 2>&1

:: Agent durumunu kontrol et
echo [%TIME%] Agent durumu kontrol ediliyor...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo [%TIME%] UYARI: Node.js zaten calisiyor!
    echo [%TIME%] Mevcut node islemlerini durduruyor...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 >nul
)

:: Agent'i baslat
echo [%TIME%] Agent baslatiliyor...
echo [%TIME%] Komut: npm run agent:loop
echo.
echo ===================================================
echo    AGENT LOG CIKTI BASLADI - CANLI TAKIP
echo ===================================================
echo.

:: Agent'i calistir ve log'u goster
npm run agent:loop

:: Eger buraya gelirse agent durmus demektir
echo.
echo ===================================================
echo    AGENT DURDU!
echo ===================================================
echo.
echo [%TIME%] Agent beklenmedik sekilde durdu!
echo [%TIME%] 10 saniye sonra yeniden baslatilacak...
timeout /t 10

:: Yeniden baslatma dongusu
:restart_loop
echo.
echo [%TIME%] Yeniden baslatiliyor...
:: Lock dosyalarini temizle
if exist "agent\STOP" del /f /q "agent\STOP" >nul 2>&1
if exist "agent\agent.lock" del /f /q "agent\agent.lock" >nul 2>&1
if exist "tools\agent-runner\agent.lock" del /f /q "tools\agent-runner\agent.lock" >nul 2>&1

npm run agent:loop

echo [%TIME%] Agent yine durdu! 5 saniye sonra tekrar deneniyor...
timeout /t 5
goto restart_loop
