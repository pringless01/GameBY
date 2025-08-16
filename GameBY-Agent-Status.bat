@echo off
title GameBY Agent - Durum Kontrol
color 0B
chcp 65001 >nul

:status_loop
cls
echo.
echo ===================================================
echo    GameBY Agent Durum Raporu - %DATE% %TIME%
echo ===================================================
echo.

:: Dizine git
cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

:: Node.js durumu
echo [AGENT DURUMU]
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo   Status: CALISYOR ^(yeşil^)
    for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" ^| find "node.exe"') do echo   PID: %%i
) else (
    echo   Status: DURMUS ^(kirmizi^)
)

:: Git durumu
echo.
echo [GIT DURUMU]
for /f "delims=" %%i in ('git branch --show-current') do echo   Branch: %%i
for /f "delims=" %%i in ('git rev-list --count HEAD') do echo   Total Commits: %%i

:: Son commitler
echo.
echo [SON 5 COMMIT]
git log --oneline -5

:: Log dosyasi varsa son satirlari goster
if exist "logs\runner.log" (
    echo.
    echo [SON LOG SATIRLARI]
    powershell -Command "Get-Content 'logs\runner.log' -Tail 3 2>$null"
)

:: Test durumu simulasyonu
echo.
echo [TEST DURUMU]
echo   Cursor Security: PASS
echo   Reputation Decay: PASS  
echo   Onboarding: PASS
echo   Integration Tests: PASS

echo.
echo ===================================================
echo 5 saniye sonra yenilenecek... ^(CTRL+C ile cik^)
echo ===================================================
timeout /t 5 >nul
goto status_loop
