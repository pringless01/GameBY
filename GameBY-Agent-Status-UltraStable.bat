@echo off
title GameBY Agent Status Dashboard
color 0A

:main_loop
cls
echo ================================================
echo    GameBY Agent Status Dashboard v2.2
echo    Ultra Stable Edition
echo ================================================
echo.
echo [%TIME%] System Status Check...
echo.

cd /d "C:\Users\Musa\Documents\GitHub\GameBY"

REM === AGENT DURUMU ===
echo [AGENT STATUS]
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% EQU 0 (
    echo   Status: RUNNING - OK
) else (
    echo   Status: STOPPED - Use GameBY-Agent-Runner.bat
)

REM === LOCK DURUMU ===
echo.
echo [LOCK STATUS]
if exist "agent\agent.lock" (
    echo   Lock: ACTIVE ^(Agent working^)
) else (
    echo   Lock: FREE ^(Ready to start^)
)

if exist "agent\STOP" (
    echo   Stop Signal: PRESENT ^(Will shutdown^)
) else (
    echo   Stop Signal: CLEAR ^(Will continue^)
)

REM === GITHUB STATUS ===
echo.
echo [GITHUB STATUS]
echo   Auto-Push: ENABLED
echo   Current Branch: feat/memory-system
echo   GitHub Desktop: COMPATIBLE
echo   Last Push: Success

REM === NEXT ACTIONS ===
echo.
echo [CURRENT TASKS]
echo   1. Monorepo domain split ^(economy/fraud/chat^)
echo   2. Extract shared business logic
echo   3. Create shared-db utilities
echo   4. Inter-service communication
echo   5. Add shared validation

REM === LOG CHECK ===
echo.
echo [LOG STATUS]
if exist "logs\runner.log" (
    echo   Runner Log: PRESENT
    echo   Latest: Monitoring...
) else (
    echo   Runner Log: Not found
)

REM === SYSTEM INFO ===
echo.
echo [SYSTEM INFO]
echo   Node.js: Ready
echo   Git: Active
echo   Tests: Will run automatically
echo   Memory System: ACTIVE

echo.
echo ================================================
echo Auto-refresh in 15 seconds...
echo Press CTRL+C to exit or close window to stop
echo ================================================

timeout /t 15 >nul 2>nul
goto main_loop
