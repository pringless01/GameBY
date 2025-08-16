:: filepath: C:\Users\Musa\Documents\GitHub\GameBY\GameBY-Agent-Runner.bat
@echo off
setlocal enableextensions enabledelayedexpansion

REM Repo kokune gec
cd /d "%~dp0"

REM Klasorler
if not exist "logs" mkdir "logs"
if not exist "agent" mkdir "agent"

REM Calisma ortami (gerekirse duzenleyebilirsin)
set REQUIRE_OPENAI=1
set MODEL_PRIMARY=gpt-4o
set MODEL_THINK=gpt-5
set USE_GPT5_ON=refactor,security,release,infra,migration,controller,service,repo,auth,cookie,redis
set ANNOUNCE=1
set ANNOUNCE_TO=pr:16
set MAX_COMMITS_PER_HOUR=60
set MAX_IDLE_SECONDS=0
set ALLOW_PROD=0

REM STOP temizle (graceful start)
if exist "agent\STOP" del /f /q "agent\STOP"

REM Bagimliliklar (ilk kurulum icin)
if not exist "node_modules" (
  echo [bootstrap] npm ci calistiriliyor...
  call npm ci
)

REM Arguman yakala (tum)
set PROMPT=%*
if not "%PROMPT%"=="" (
  echo [inject] Prompt alindi: %PROMPT%
  node tools\agent-runner\prompt-inject.cjs "%PROMPT%"
  goto tail
)

REM Lock varsa ikinci instance baslatma
if exist "agent\agent.lock" (
  echo [runner] agent.lock var; yeni instance baslatilmiyor. Log izleniyor...
) else (
  echo [runner] baslatiliyor...
  start "GameBY Agent Runner" cmd /c "node tools\agent-runner\runner.js --loop"
  timeout /t 2 >nul
)

:tail
echo [logs] logs\runner.log izleniyor (Ctrl+C ile cik)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "if(!(Test-Path 'logs/runner.log')){New-Item -ItemType File -Path 'logs/runner.log' | Out-Null}; Get-Content -Path 'logs/runner.log' -Wait -Tail 80"

endlocal