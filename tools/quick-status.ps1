Clear-Host
Write-Host "🚀 GAMEBY INTELLIGENT AGENT" -ForegroundColor Green
Write-Host "=" * 40
Write-Host ""

Write-Host "🎯 Testing Escalation System:" -ForegroundColor Cyan
node "c:\Users\Musa\Documents\GitHub\GameBY\tools\escalation-system.cjs" status

Write-Host ""
Write-Host "📦 Current Status:" -ForegroundColor Cyan
Set-Location "c:\Users\Musa\Documents\GitHub\GameBY"
$branch = git branch --show-current
$ahead = git rev-list --count HEAD ^origin/feat/memory-system
Write-Host "Branch: $branch"
Write-Host "Ahead: $ahead commits"

Write-Host ""
Write-Host "🎮 Available Commands:" -ForegroundColor Cyan
Write-Host "  node tools/intelligent-runner.cjs start     - Start intelligent agent"
Write-Host "  node tools/escalation-system.cjs thinking   - Activate thinking mode" 
Write-Host "  node tools/test-escalation.cjs             - Run tests"

Write-Host ""
Write-Host "Multi-tier escalation system ready!" -ForegroundColor Green
Write-Host "GPT-4o-mini -> GPT-4o -> GPT-4 -> GPT-5 -> Thinking Mode" -ForegroundColor Yellow
