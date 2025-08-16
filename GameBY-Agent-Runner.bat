:: filepath: C:\Users\Musa\Documents\GitHub\GameBY\GameBY-Agent-Runner.bat
@echo off
setlocal enableextensions enabledelayedexpansion

REM Repo köküne geç
cd /d "%~dp0"

REM Klasörler
if not exist "tools\agent-runner\logs" mkdir "tools\agent-runner\logs"
if not exist "agent" mkdir "agent"

REM Çalışma ortamı (gerekirse düzenleyebilirsin)
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

REM Bağımlılıklar (ilk kurulum için)
if not exist "node_modules" (
  echo [bootstrap] npm ci calistiriliyor...
  call npm ci
)

REM Lock varsa ikinci instance baslatma
if exist "agent\agent.lock" (
  echo [runner] agent.lock var; yeni instance baslatilmiyor. Log izleniyor...
) else (
  echo [runner] baslatiliyor...
  start "GameBY Agent Runner" cmd /c "node tools\agent-runner\runner.js --loop"
  timeout /t 2 >nul
)

echo [logs] tools\agent-runner\logs\runner.log izleniyor (Crtl+C ile cik)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "if(!(Test-Path 'tools/agent-runner/logs/runner.log')){New-Item -ItemType File -Path 'tools/agent-runner/logs/runner.log' | Out-Null}; Get-Content -Path 'tools/agent-runner/logs/runner.log' -Wait -Tail 80"

endlocal