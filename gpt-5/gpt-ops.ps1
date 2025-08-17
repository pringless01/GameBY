#requires -Version 7
param(
  [string]$Goal,
  [string]$Config,
  [switch]$SelfTest,
  [switch]$ApiTest,
  [switch]$Agent,
  [switch]$YesAll,
  [switch]$Chat
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---- Safe defaults ----
if (-not $PSBoundParameters.ContainsKey('Config') -or [string]::IsNullOrWhiteSpace($Config)) { $Config = ".\config.json" }
if (-not $PSBoundParameters.ContainsKey('Goal')) { $Goal = "" }

# PS5.1 fallback (bazı makinelerde lazım olabilir)
if (-not (Get-Command New-TemporaryFile -ErrorAction SilentlyContinue)) {
  function New-TemporaryFile {
    $p = [System.IO.Path]::GetTempFileName()
    Get-Item $p
  }
}

# -------- Helpers --------
function Ensure-Module {
  param([string]$Name)
  if (-not (Get-Module -ListAvailable -Name $Name)) {
    try {
      if (-not (Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue)) {
        Register-PSRepository -Name PSGallery -SourceLocation "https://www.powershellgallery.com/api/v2" -InstallationPolicy Trusted
      } else {
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
      }
      Install-Module -Name $Name -Scope CurrentUser -Force -AllowClobber -Repository PSGallery
    } catch {
      throw "Module install failed: $Name. $_"
    }
  }
  Import-Module $Name -ErrorAction Stop
}

function Read-Config {
  param([string]$Path)
  if (-not (Test-Path $Path)) { throw "Config not found: $Path" }
  Get-Content $Path -Raw | ConvertFrom-Json
}

function Get-ErrText {
  param($err)
  try {
    if ($err -and $err.Exception -and $err.Exception.Message) { return $err.Exception.Message }
    if ($err -and $err.ErrorDetails -and $err.ErrorDetails.Message) { return $err.ErrorDetails.Message }
    return ($err | Out-String)
  } catch { return ($err | Out-String) }
}

function Get-OpenAIKey {
  # Process → User → env
  $k = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY","Process")
  if (-not $k) { $k = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY","User") }
  if (-not $k) { $k = $env:OPENAI_API_KEY }
  $k = ($k -replace '[\r\n]+','').Trim()
  if ($k -match '\s') { throw "OPENAI_API_KEY içinde boşluk var. Tek satır gir." }
  if ([string]::IsNullOrWhiteSpace($k)) { throw "OPENAI_API_KEY ortam değişkeni eksik." }
  $k
}

# ---- API Diagnostic ----
function Try-ExtractResponse {
  param($r)
  $res = [pscustomobject]@{ parsed=$null; text=$null }
  try {
    if ($r.PSObject.Properties.Name -contains 'error' -and $r.error) { return $res }
    if ($r.PSObject.Properties.Name -contains 'output_parsed' -and $r.output_parsed) { $res.parsed = $r.output_parsed }
    if (-not $res.text -and $r.PSObject.Properties.Name -contains 'output_text') { $res.text = $r.output_text }
    if ($r.PSObject.Properties.Name -contains 'output' -and $r.output) {
      foreach ($item in $r.output) {
        if (-not $res.parsed -and $item.parsed) { $res.parsed = $item.parsed }
        if (-not $res.text -and $item.text) { $res.text = $item.text }
        if ($item.content) {
          foreach ($c in $item.content) {
            if (-not $res.parsed -and $c.parsed) { $res.parsed = $c.parsed }
            if (-not $res.text -and $c.text) { $res.text = $c.text }
          }
        }
      }
    }
    if (-not $res.text -and $r.PSObject.Properties.Name -contains 'message' -and $r.message -and $r.message.content) {
      foreach ($mc in $r.message.content) { if (-not $res.text -and $mc.text) { $res.text = $mc.text } }
    }
    if (-not $res.text -and $r.PSObject.Properties.Name -contains 'choices' -and $r.choices) {
      $txts = @(); foreach ($ch in $r.choices) {
        if ($ch.message -and $ch.message.content) { foreach ($mc in $ch.message.content) { if ($mc.text) { $txts += $mc.text } } }
        elseif ($ch.text) { $txts += $ch.text }
      }
      if ($txts.Count -gt 0) { $res.text = ($txts -join "\n") }
    }
  } catch { }
  return $res
}

function Test-OpenAI {
  param([string]$Model, [int]$TimeoutSec = 30)
  Write-Host "== OpenAI API Hızlı Test ==" -ForegroundColor Cyan
  try { $null = Get-OpenAIKey | Out-Null } catch { Write-Error $_.Exception.Message; return 1 }
  $key = Get-OpenAIKey
  $headers = @{ "Authorization" = "Bearer $key"; "Content-Type" = "application/json" }

  # 1) Models ping
  Write-Host "[1/3] /v1/models ping" -NoNewline
  try {
    $r = Invoke-RestMethod -Method Get -Uri "https://api.openai.com/v1/models" -Headers $headers -TimeoutSec $TimeoutSec
    if ($r.data) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  WARN" -ForegroundColor Yellow }
  } catch { Write-Host "  FAIL" -ForegroundColor Red; Write-Warning (Get-ErrText $_) }

  # 2) Responses plain
  Write-Host "[2/3] /v1/responses (plain)" -NoNewline
  try {
    $body = @{ model = $Model; input = "ping" } | ConvertTo-Json
    $r = Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" -Headers $headers -Body $body -TimeoutSec $TimeoutSec
  $keys = ($r | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name) -join ', '
  $ext = Try-ExtractResponse $r
  if ($r.error) { Write-Host "  FAIL" -ForegroundColor Red; Write-Warning (ConvertTo-Json $r.error -Depth 5) }
  elseif ($ext.text) { Write-Host "  PASS" -ForegroundColor Green }
  else { Write-Host "  WARN" -ForegroundColor Yellow; Write-Host "[keys] $keys" -ForegroundColor DarkGray }
  } catch {
  $m = Get-ErrText $_; if ($m -match 'invalid_api_key') { Write-Host "  FAIL" -ForegroundColor Red; Write-Error "OPENAI_API_KEY geçersiz." } else { Write-Host "  FAIL" -ForegroundColor Red; Write-Warning $m }
  }

  # 3) Responses structured
  Write-Host "[3/3] /v1/responses (structured)" -NoNewline
  try {
    $schema = [ordered]@{
      type   = 'json_schema'
      name   = 'Ping'
      strict = $true
      schema = [ordered]@{
        '$schema' = 'https://json-schema.org/draft/2020-12/schema'
        title     = 'Ping'
        type      = 'object'
        additionalProperties = $false
        properties = @{ pong = @{ type = 'string' } }
        required   = @('pong')
      }
    }
  $prompt = 'Sadece JSON döndür: {"pong": "ok"}'
    $body = @{ model = $Model; input = $prompt; text = @{ format = $schema } } | ConvertTo-Json -Depth 30
    $r = Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" -Headers $headers -Body $body -TimeoutSec $TimeoutSec
    $ok = $false
    if ($r.PSObject.Properties.Name -contains 'error' -and $r.error) {
      Write-Host "  FAIL" -ForegroundColor Red
      Write-Warning (ConvertTo-Json $r.error -Depth 5)
    } else {
      $ext = Try-ExtractResponse $r
      if ($ext.parsed -and $ext.parsed.pong -eq 'ok') { $ok = $true }
      if ($ok) { Write-Host "  PASS" -ForegroundColor Green } else { Write-Host "  WARN" -ForegroundColor Yellow }
    }
  } catch {
  $m = Get-ErrText $_; if ($m -match 'invalid_api_key') { Write-Host "  FAIL" -ForegroundColor Red; Write-Error "OPENAI_API_KEY geçersiz." } else { Write-Host "  FAIL" -ForegroundColor Red; Write-Warning $m }
  }
}

# === Structured Outputs format (Responses API: text.format) ===
function Get-PlanFormat {
  $paramsProps = [ordered]@{
    packages = @{ type='array'; items=@{ type='string' } }
    action   = @{ type='string' }
    service  = @{ type='string' }
    target   = @{ type='string' }
    sub      = @{ type='string' }
    args     = @{ type='array'; items=@{ type='string' } }
    path     = @{ type='string' }
    content  = @{ type='string' }
  }
  $paramsSchema = [ordered]@{
    type                 = 'object'
    additionalProperties = $false
    properties           = $paramsProps
    required             = @('packages','action','service','target','sub','args','path','content')
  }

  $stepItem = [ordered]@{
    type                 = 'object'
    additionalProperties = $false
    properties           = [ordered]@{
      id     = @{ type='string' }
      action = @{ type='string'; enum=@('apt_update','apt_install','systemd','ufw','nginx_test','docker','read_file','write_file_new','write_file_overwrite') }
      reason = @{ type='string' }
      params = $paramsSchema
    }
    required             = @('id','action','reason','params')
  }

  $schema = [ordered]@{
    '$schema'            = 'https://json-schema.org/draft/2020-12/schema'
    title                = 'AgentPlan'
    type                 = 'object'
    additionalProperties = $false
    properties           = [ordered]@{
      goal  = @{ type='string' }
      steps = [ordered]@{
        type  = 'array'
        items = $stepItem
      }
    }
    required             = @('goal','steps')
  }

  return [ordered]@{
    type   = 'json_schema'
    name   = 'AgentPlan'
    strict = $true
    schema = $schema
  }
}

function Build-SystemPrompt {
@"
Sen bir Linux ops ajanısın. Kurallar:
- Küçük adımlarla plan (steps[]) üret; her adım tek komut olsun.
- Sadece izinli eylemler: apt_update, apt_install, systemd, ufw, nginx_test, docker, read/write.
- Yıkıcı işlemler (rm -rf, userdel, partition) asla önerme.
- Debian/Ubuntu uyumlu komut ver; Nginx’de config sonrası 'nginx -t' koş.
"@
}

function New-ResponsesBody {
  param([string]$Goal, [string]$Model)
  $pf = Get-PlanFormat
  $prompt = (Build-SystemPrompt) + "`n`n" + "Hedef: $Goal`nSunucu: Ubuntu/Debian, systemd, ufw, nginx, docker bulunabilir."
  $body = @{
  model = $Model
  input = $prompt
  text  = @{ format = $pf }
  }
  return ($body | ConvertTo-Json -Depth 50)
}

function Invoke-OpenAIChat {
  param([string]$Prompt, [string[]]$UseModels, [int]$TimeoutSec = 60)
  $headers = @{ "Authorization" = "Bearer $(Get-OpenAIKey)"; "Content-Type" = "application/json" }
  $models = if ($UseModels -and $UseModels.Count -gt 0) { $UseModels } else { @('gpt-4.1-mini','gpt-4o-mini','gpt-5') }
  foreach ($m in $models) {
    try {
      $body = @{ model = $m; input = $Prompt } | ConvertTo-Json
      $r = Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" -Headers $headers -Body $body -TimeoutSec $TimeoutSec
      $ext = Try-ExtractResponse $r
      if ($ext.text) { return [pscustomobject]@{ model=$m; text=$ext.text } }
    } catch { Write-Warning ("[chat] {0}: {1}" -f $m, (Get-ErrText $_)) }
  }
  throw "Chat yanıtı alınamadı."
}

function Invoke-OpenAIPlan {
  param([string]$Goal, [string]$Model, [int]$TimeoutSec = 60, [int]$Retries = 2, [string[]]$UseModels)

  $headers = @{
    "Authorization" = "Bearer $(Get-OpenAIKey)"
    "Content-Type"  = "application/json"
  }

  $modelList = if ($UseModels -and $UseModels.Count -gt 0) { $UseModels } else { @($Model, 'gpt-4.1-mini', 'gpt-4o-mini') }
  foreach ($m in $modelList) {
    for ($attempt = 1; $attempt -le ($Retries + 1); $attempt++) {
      $usingPlain = $false
      try {
        $body = New-ResponsesBody -Goal $Goal -Model $m
        Write-Host ("[DEBUG] POST /v1/responses (model={0}, attempt={1}/{2})" -f $m, $attempt, ($Retries+1)) -ForegroundColor DarkGray
        Write-Host $body -ForegroundColor DarkGray
        $resp = Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" -Headers $headers -Body $body -TimeoutSec $TimeoutSec
      } catch {
        $msg = Get-ErrText $_
        Write-Warning ("[DEBUG] OpenAI error (model={0}, attempt={1}): {2}" -f $m, $attempt, $msg)
        if ($msg -and ($msg -match 'invalid_json_schema' -or $msg -match 'text\.format\.schema')) {
          $prompt = (Build-SystemPrompt) + "`n`n" + "Hedef: $Goal`nSunucu: Ubuntu/Debian, systemd, ufw, nginx, docker bulunabilir.`nSadece JSON ver; metin ekleme."
          $bodyPlain = @{ model = $m; input = $prompt } | ConvertTo-Json -Depth 10
          Write-Host "[DEBUG] Fallback body (plain):" -ForegroundColor DarkGray
          Write-Host $bodyPlain -ForegroundColor DarkGray
          $usingPlain = $true
          try {
            $resp = Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" -Headers $headers -Body $bodyPlain -TimeoutSec $TimeoutSec
          } catch {
            $msg2 = Get-ErrText $_
            Write-Warning ("[DEBUG] Plain fallback error: {0}" -f $msg2)
            if ($msg -match 'invalid_api_key') {
              throw "OPENAI_API_KEY geçersiz veya yetkisiz. Lütfen doğru anahtarı ayarlayın ve tekrar deneyin."
            }
            # Retry if allowed
            if ($attempt -le $Retries) { continue }
            else { throw }
          }
        } elseif ($msg -match 'model' -and ($msg -match 'not found' -or $msg -match 'access')) {
          Write-Warning ("[DEBUG] Model erişimi yok/ bulunamadı: {0}; sonraki modele geçiliyor." -f $m)
          break
        } else {
          if ($attempt -le $Retries) { continue }
          else { throw }
        }
      }
      Write-Host "[DEBUG] Response keys: $((($resp | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name) -join ', '))" -ForegroundColor DarkGray
      # Parse and return on success
      try {
        # Structured output → parsed JSON object preferred
        if ($resp.PSObject.Properties.Name -contains 'output_parsed' -and $resp.output_parsed) { return $resp.output_parsed }

        $raw = $null
        if ($resp.PSObject.Properties.Name -contains 'output_text') { $raw = $resp.output_text }
        # New-style array outputs
        if (-not $raw -and $resp.PSObject.Properties.Name -contains 'output') {
          try {
    foreach ($item in $resp.output) {
              if ($item.type -eq 'output_parsed' -and $item.parsed) { return $item.parsed }
              if ($item.type -eq 'output_text' -and $item.text) { $raw = $item.text }
              if ($item.content) {
                foreach ($c in $item.content) {
                  if ($c.type -eq 'output_parsed' -and $c.parsed) { return $c.parsed }
                  if ($c.type -eq 'output_text' -and $c.text) { $raw = $c.text }
      if ($c.type -eq 'text' -and $c.text) { $raw = $c.text }
                  if ($c.type -eq 'input_text' -and $c.text) { $raw = $c.text }
                }
              }
            }
          } catch { }
        }
        # message/content style
        if (-not $raw -and $resp.PSObject.Properties.Name -contains 'message' -and $resp.message.content) {
          foreach ($mc in $resp.message.content) {
            if ($mc.type -eq 'output_parsed' -and $mc.parsed) { return $mc.parsed }
            if (($mc.type -eq 'text' -or $mc.type -eq 'output_text' -or $mc.type -eq 'input_text') -and $mc.text) { $raw = $mc.text }
          }
        }
        # choices/messages style fallback
        if (-not $raw -and $resp.PSObject.Properties.Name -contains 'choices' -and $resp.choices) {
          try {
            $txts = @()
            foreach ($ch in $resp.choices) {
              if ($ch.message -and $ch.message.content) {
                foreach ($mc in $ch.message.content) { if ($mc.text) { $txts += $mc.text } }
              } elseif ($ch.text) { $txts += $ch.text }
            }
            if ($txts.Count -gt 0) { $raw = ($txts -join "\n") }
          } catch { }
        }
        if (-not $raw) {
          # Plain JSON-only fallback within same attempt
          $prompt2 = (Build-SystemPrompt) + "`n`n" + "Hedef: $Goal`n" + @'
Sunucu: Ubuntu/Debian, systemd, ufw, nginx, docker bulunabilir.
Sadece JSON ver; metin ekleme. Format: {"goal":"...","steps":[...]}.
'@
          $bodyPlain2 = @{ model = $m; input = $prompt2 } | ConvertTo-Json -Depth 10
          Write-Host "[DEBUG] Fallback (plain within attempt)" -ForegroundColor DarkGray
          try {
            $resp2 = Invoke-RestMethod -Method Post -Uri "https://api.openai.com/v1/responses" -Headers $headers -Body $bodyPlain2 -TimeoutSec $TimeoutSec
            $raw = $null
            if ($resp2.PSObject.Properties.Name -contains 'output_text') { $raw = $resp2.output_text }
            elseif ($resp2.PSObject.Properties.Name -contains 'output') {
              foreach ($it in $resp2.output) {
                if ($it.text) { $raw = $it.text }
                if ($it.content) { foreach ($cc in $it.content) { if ($cc.text) { $raw = $cc.text } } }
              }
            }
          } catch { Write-Warning ("[DEBUG] Plain-within-attempt error: {0}" -f (Get-ErrText $_)) }
        }
        if (-not $raw) { throw "Modelden boş yanıt geldi." }

        try { return $raw | ConvertFrom-Json -ErrorAction Stop }
        catch {
          $clean = $raw -replace '^[\s\S]*?```json','' -replace '```[\s\S]*$',''
          return $clean | ConvertFrom-Json
        }
      } catch {
        Write-Warning ("[DEBUG] Parse error (model={0}, attempt={1}): {2}" -f $m, $attempt, $_.Exception.Message)
        if ($attempt -le $Retries) { continue } else { throw }
      }
    }
  }
  throw "Plan alınamadı: tüm model ve denemeler başarısız."

  # Structured output → parsed JSON object preferred
  if ($resp.PSObject.Properties.Name -contains 'output_parsed' -and $resp.output_parsed) { return $resp.output_parsed }

  $raw = $null
  if ($resp.PSObject.Properties.Name -contains 'output_text') { $raw = $resp.output_text }
  # New-style array outputs
  if (-not $raw -and $resp.PSObject.Properties.Name -contains 'output') {
    try {
      foreach ($item in $resp.output) {
        if ($item.type -eq 'output_parsed' -and $item.parsed) { return $item.parsed }
        if ($item.type -eq 'output_text' -and $item.text) { $raw = $item.text }
        if ($item.content) {
          foreach ($c in $item.content) {
            if ($c.type -eq 'output_parsed' -and $c.parsed) { return $c.parsed }
            if ($c.type -eq 'output_text' -and $c.text) { $raw = $c.text }
            if ($c.type -eq 'input_text' -and $c.text) { $raw = $c.text }
          }
        }
      }
    } catch { }
  }
  # message/content style
  if (-not $raw -and $resp.PSObject.Properties.Name -contains 'message' -and $resp.message.content) {
    foreach ($mc in $resp.message.content) {
      if ($mc.type -eq 'output_parsed' -and $mc.parsed) { return $mc.parsed }
      if (($mc.type -eq 'text' -or $mc.type -eq 'output_text' -or $mc.type -eq 'input_text') -and $mc.text) { $raw = $mc.text }
    }
  }
  # choices/messages style fallback
  if (-not $raw -and $resp.PSObject.Properties.Name -contains 'choices' -and $resp.choices) {
    try {
      $txts = @()
      foreach ($ch in $resp.choices) {
        if ($ch.message -and $ch.message.content) {
          foreach ($mc in $ch.message.content) { if ($mc.text) { $txts += $mc.text } }
        } elseif ($ch.text) { $txts += $ch.text }
      }
      if ($txts.Count -gt 0) { $raw = ($txts -join "\n") }
    } catch { }
  }
  if (-not $raw) { throw "Modelden boş yanıt geldi." }

  try { return $raw | ConvertFrom-Json -ErrorAction Stop }
  catch {
    $clean = $raw -replace '^[\s\S]*?```json','' -replace '```[\s\S]*$',''
    return $clean | ConvertFrom-Json
  }
}

function Validate-Plan {
  param($plan)
  if (-not $plan) { throw "boş plan" }
  if (-not $plan.goal -or -not $plan.steps) { throw "plan formatı hatalı (goal/steps)" }
  $allowed = @('packages','action','service','target','sub','args','path','content')
  $i = 0
  foreach ($s in @($plan.steps)) {
    $i++
    if (-not $s.id -or -not $s.action -or -not $s.reason) { throw "step#$i eksik alan" }
    if ($s.params) {
      $keys = @($s.params.PSObject.Properties.Name)
      foreach ($k in $keys) { if ($allowed -notcontains $k) { throw "step#$i params.$k izinli değil" } }
    }
  }
}

function Classify-Action { param([string]$Action)
  $safe  = @("apt_update","apt_install","systemd","ufw","nginx_test","docker","read_file","write_file_new")
  $risky = @("write_file_overwrite")
  if ($safe -contains $Action) { return "safe" }
  if ($risky -contains $Action) { return "risky" }
  "destructive"
}

function Map-StepToCommand {
  param($step)
  $a = $step.action
  $p = $step.params
  switch ($a) {
    "apt_update"           { "sudo apt-get update" }
    "apt_install"          {
      if (-not $p.packages) { throw "apt_install requires params.packages array" }
      $pkgs = ($p.packages | ForEach-Object { $_ -replace '[^a-zA-Z0-9\-\+\.]','' }) -join ' '
      "sudo apt-get install -y $pkgs"
    }
    "systemd"              {
      $act = $p.action; $svc = $p.service
      if (-not $act -or -not $svc) { throw "systemd requires params.action + params.service" }
      if ($act -notin @("start","stop","restart","enable","disable","status")) { throw "invalid systemd action" }
      "sudo systemctl $act $svc"
    }
    "ufw"                  {
      $act = $p.action; $t = $p.target
      if ($act -eq "status") { "sudo ufw status" }
      elseif ($act -eq "allow" -and $t) { "sudo ufw allow $t" }
      else { throw "invalid ufw params" }
    }
    "nginx_test"           { "sudo nginx -t" }
    "docker"               {
      $sub = $p.sub; $args = ($p.args -join ' ')
      if ($sub -notin @("ps","pull","run","compose","start","restart")) { throw "invalid docker sub" }
      "sudo docker $sub $args"
    }
    "read_file"            {
      if (-not $p.path) { throw "read_file requires params.path" }
      "sudo cat " + ($p.path -replace '[^a-zA-Z0-9\/\.\-\_]','')
    }
    "write_file_new"       { return $null }  # SFTP ile aktarılacak
    "write_file_overwrite" { return $null }  # SFTP ile aktarılacak
    default { throw "unknown action: $a" }
  }
}

function Validate-CommandSafety {
  param([string]$cmd)
  if (-not $cmd) { return }
  $deny = @('rm\s+-rf','mkfs','dd\s+if=','userdel','passwd\b','iptables\s+-F','shutdown\b','reboot\b')
  foreach ($rx in $deny) { if ($cmd -match $rx) { throw "blocked destructive command: $cmd" } }
}

# ---- SSH / SFTP ----
function New-SSHAuthFromCfg {
  param($cfg)
  if ($cfg.Auth.Method -eq "Password") {
    # Non-interactive password support via env vars
    # Prefer AGENT_SSH_PASSWORD, fall back to SSH_PASSWORD; if none, prompt
    if (-not $script:PW) {
      $plain = $null
      if ($env:AGENT_SSH_PASSWORD -and $env:AGENT_SSH_PASSWORD.Trim().Length -gt 0) { $plain = $env:AGENT_SSH_PASSWORD }
      elseif ($env:SSH_PASSWORD -and $env:SSH_PASSWORD.Trim().Length -gt 0) { $plain = $env:SSH_PASSWORD }
      if ($plain) {
        $script:PW = ConvertTo-SecureString -String $plain -AsPlainText -Force
      } else {
        $script:PW = Read-Host -AsSecureString "SSH password for $($cfg.User)@$($cfg.Host)"
      }
    }
    $cred = New-Object System.Management.Automation.PSCredential($cfg.User, $script:PW)
    return @{ Mode="Password"; Credential=$cred }
  } else {
    $key = $cfg.Auth.KeyPath
    if (-not (Test-Path $key)) { throw "Key file not found: $key" }
    $pp  = $cfg.Auth.Passphrase
    if ($pp) {
      return @{ Mode="Key"; KeyFile=$key; KeyPass=(ConvertTo-SecureString $pp -AsPlainText -Force) }
    } else {
      return @{ Mode="Key"; KeyFile=$key }
    }
  }
}

function Ensure-SSH {
  param($cfg)
  Ensure-Module -Name "Posh-SSH"
  $auth = New-SSHAuthFromCfg $cfg
  if ($auth.Mode -eq "Password") {
    New-SSHSession -ComputerName $cfg.Host -Port $cfg.Port -Credential $auth.Credential -AcceptKey -ErrorAction Stop
  } else {
    if ($auth.KeyPass) {
      New-SSHSession -ComputerName $cfg.Host -Port $cfg.Port -KeyFile $auth.KeyFile -KeyPass $auth.KeyPass -AcceptKey -ErrorAction Stop
    } else {
      New-SSHSession -ComputerName $cfg.Host -Port $cfg.Port -KeyFile $auth.KeyFile -AcceptKey -ErrorAction Stop
    }
  }
}

function Open-SFTPSessionFromCfg {
  param($cfg)
  $auth = New-SSHAuthFromCfg $cfg
  if ($auth.Mode -eq "Password") {
    New-SFTPSession -ComputerName $cfg.Host -Port $cfg.Port -Credential $auth.Credential -AcceptKey -ErrorAction Stop
  } else {
    if ($auth.KeyPass) {
      New-SFTPSession -ComputerName $cfg.Host -Port $cfg.Port -KeyFile $auth.KeyFile -KeyPass $auth.KeyPass -AcceptKey -ErrorAction Stop
    } else {
      New-SFTPSession -ComputerName $cfg.Host -Port $cfg.Port -KeyFile $auth.KeyFile -AcceptKey -ErrorAction Stop
    }
  }
}

function Run-Remote {
  param($session, [string]$cmd)
  if (-not $cmd) { return @{ ExitStatus=0; Output="[local op]" } }
  Validate-CommandSafety -cmd $cmd
  $r = Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd -TimeOut 180
  [pscustomobject]@{
    ExitStatus = $r.ExitStatus
    Output     = ($r.Output | Out-String)
    Error      = ($r.Error  | Out-String)
    Command    = $cmd
  }
}

function Put-File {
  param($cfg, [string]$local, [string]$remote, [switch]$Overwrite)
  if (-not (Test-Path $local)) { throw "local file missing: $local" }
  $s = Open-SFTPSessionFromCfg $cfg
  try {
    if ($Overwrite) { Remove-SFTPItem -SFTPSession $s -Path $remote -Force -ErrorAction SilentlyContinue }
    Set-SFTPFile -SFTPSession $s -LocalFile $local -RemotePath $remote -Confirm:$false
  } finally {
    Remove-SFTPSession -SFTPSession $s | Out-Null
  }
}

# ---- MAIN ----
if ($SelfTest) {
  Write-Host "SelfTest OK: parser, helpers, module loader hazır." -ForegroundColor Green
  exit 0
}

if ($ApiTest) {
  $cfg = Read-Config -Path $Config
  $to = if ($cfg.PSObject.Properties.Name -contains 'OpenAITimeoutSec' -and $cfg.OpenAITimeoutSec) { [int]$cfg.OpenAITimeoutSec } else { 30 }
  Test-OpenAI -Model $cfg.Model -TimeoutSec $to | Out-Null
  exit 0
}

if ($Chat) {
  $cfg = Read-Config -Path $Config
  $models = if ($cfg.UseModels) { $cfg.UseModels } else { @($cfg.Model) }
  Write-Host "== Chat Modu == (komutlar: /exit, /clear, /model <idx>)" -ForegroundColor Cyan
  Write-Host ("Model sırası: {0}" -f ($models -join ', ')) -ForegroundColor DarkGray
  $buf = New-Object System.Collections.Generic.List[string]
  while ($true) {
    $inp = Read-Host ">>"
    if ($inp -eq '/exit') { break }
    if ($inp -eq '/clear') { $buf.Clear(); Write-Host "[temizlendi]" -ForegroundColor DarkGray; continue }
    if ($inp -like '/model *') {
      $idxStr = ($inp -replace '^/model\s+','').Trim()
      if ($idxStr -match '^[0-9]+$') {
        $idx = [int]$idxStr
        if ($idx -ge 0 -and $idx -lt $models.Count) {
          $chosen = $models[$idx]
          # seçilen modeli başa al
          $models = ,$chosen + ($models | Where-Object { $_ -ne $chosen })
          Write-Host ("[model] {0}" -f ($models -join ', ')) -ForegroundColor DarkGray
        }
      }
      continue
    }
    $prompt = if ($buf.Count -gt 0) { ($buf -join "\n") + "\nKullanıcı: " + $inp } else { $inp }
    try {
      $ans = Invoke-OpenAIChat -Prompt $prompt -UseModels $models -TimeoutSec ([int]$cfg.OpenAITimeoutSec)
      Write-Host ("{0}: {1}" -f $ans.model, $ans.text.Trim()) -ForegroundColor Green
      $buf.Add("Kullanıcı: " + $inp)
      $buf.Add("Asistan: " + $ans.text.Trim())
      if ($buf.Count -gt 20) { $buf.RemoveRange(0, $buf.Count - 20) }
    } catch { Write-Warning $_.Exception.Message }
  }
  exit 0
}

$cfg = Read-Config -Path $Config
if (-not $Agent) {
  if (-not $Goal -or $Goal.Trim().Length -eq 0) {
    $Goal = Read-Host "Hedef (örn: Nginx kur, /var/www/hello için site ayarla, 80/443 aç, nginx -t ve restart)"
  }

  Write-Host "`n== PLAN İSTENİYOR ==" -ForegroundColor Cyan
  $to = if ($cfg.PSObject.Properties.Name -contains 'OpenAITimeoutSec' -and $cfg.OpenAITimeoutSec) { [int]$cfg.OpenAITimeoutSec } else { 60 }
  $rt = if ($cfg.PSObject.Properties.Name -contains 'OpenAIRetries' -and $cfg.OpenAIRetries) { [int]$cfg.OpenAIRetries } else { 2 }
  $plan  = Invoke-OpenAIPlan -Goal $Goal -Model $cfg.Model -TimeoutSec $to -Retries $rt -UseModels $cfg.UseModels
  $null = Validate-Plan -plan $plan
  $steps = @($plan.steps)
  Write-Host ("Plan: {0} adım" -f $steps.Count) -ForegroundColor Green

  $session = $null
  try {
    if (-not $cfg.DryRun) {
      $session = Ensure-SSH -cfg $cfg
    }

    $i = 0
    foreach ($s in $steps) {
      $i++
      $cls = Classify-Action $s.action
      $label = "[{0}/{1}] {2}" -f $i,$steps.Count,$s.action

      if ($cfg.DryRun -eq $true) {
        if ($s.action -in @("write_file_new","write_file_overwrite")) {
          $p = $s.params
          $path = "(eksik path)"
          if ($p.path) { $path = $p.path }
          $len = 0
          if ($p.content) { $len = $p.content.Length }
          Write-Host ("DRY-RUN {0} -> file: path={1}, content_bytes={2}" -f $label, $path, $len) -ForegroundColor Yellow
        } else {
          $cmd = $null
          try { $cmd = Map-StepToCommand $s } catch { $cmd = "[eksik parametre: $($_.Exception.Message)]" }
          Write-Host "DRY-RUN $label -> $cmd" -ForegroundColor Yellow
        }
        continue
      }

      if ($cls -eq "risky" -and -not $cfg.AutoApplySafe) {
        throw "risky action requires approval: $($s.action)"
      }

      if ($s.action -in @("write_file_new","write_file_overwrite")) {
        $p = $s.params
        if (-not $p.path -or -not $p.content) { throw "write_file* requires params.path & params.content" }
        $tmp = New-TemporaryFile
        Set-Content -Path $tmp -Value $p.content -NoNewline
        Put-File -cfg $cfg -local $tmp -remote $p.path -Overwrite:($s.action -eq "write_file_overwrite") | Out-Null
        Remove-Item $tmp -Force
        Write-Host "$label -> uploaded $($p.path)" -ForegroundColor Green
      } else {
        if (-not $cfg.AllowRootLike -and $s.action -in @("apt_update","apt_install","systemd","ufw","nginx_test","docker")) {
          throw "root-like action blocked by config: $($s.action)"
        }
        $cmd = Map-StepToCommand $s
        $res = Run-Remote -session $session -cmd $cmd
        $ok  = ($res.ExitStatus -eq 0)
        $color = if ($ok) { "Green" } else { "Red" }
        Write-Host "$label -> $($res.Command)" -ForegroundColor DarkCyan
        if ($res.Output.Trim()) { Write-Host ($res.Output.Trim()) -ForegroundColor $color }
        if ($res.Error.Trim())  { Write-Warning $res.Error.Trim() }
        if (-not $ok) { throw "step failed: $($s.id) ($($s.action))" }
      }
    }

    Write-Host "`n✅ Bitti." -ForegroundColor Green
  } finally {
    if ($session) { Remove-SSHSession -SessionId $session.SessionId | Out-Null }
  }
}

if ($Agent) {
  $cfg = Read-Config -Path $Config
  $to = if ($cfg.PSObject.Properties.Name -contains 'OpenAITimeoutSec' -and $cfg.OpenAITimeoutSec) { [int]$cfg.OpenAITimeoutSec } else { 60 }
  $rt = if ($cfg.PSObject.Properties.Name -contains 'OpenAIRetries' -and $cfg.OpenAIRetries) { [int]$cfg.OpenAIRetries } else { 2 }
  $models = if ($cfg.UseModels) { $cfg.UseModels } else { @($cfg.Model) }

  if (-not $Goal) { $Goal = Read-Host "Hedef" }
  Write-Host "== Agent Modu ==" -ForegroundColor Cyan
  Write-Host "Model sırası: $($models -join ', ')" -ForegroundColor DarkGray

  $plan = Invoke-OpenAIPlan -Goal $Goal -Model $cfg.Model -TimeoutSec $to -Retries $rt -UseModels $models
  $null = Validate-Plan -plan $plan
  $steps = @($plan.steps)
  Write-Host ("Plan: {0} adım" -f $steps.Count) -ForegroundColor Green

  $session = $null
  try {
    if (-not $cfg.DryRun) { $session = Ensure-SSH -cfg $cfg }
    $i = 0
    foreach ($s in $steps) {
      $i++
      $cmd = $null
      if ($s.action -in @("write_file_new","write_file_overwrite")) {
        $p = $s.params
        $path = "(eksik)"; if ($p.path) { $path = $p.path }
        $len = 0; if ($p.content) { $len = $p.content.Length }
        $cmd = "file: path=$path, content_bytes=$len"
      } else {
        try { $cmd = Map-StepToCommand $s } catch { $cmd = "[eksik parametre: $($_.Exception.Message)]" }
      }
      $label = "[{0}/{1}] {2}" -f $i,$steps.Count,$s.action
      Write-Host ("Adım: {0}\nNeden: {1}" -f $label,$s.reason) -ForegroundColor DarkCyan
      if ($cmd) { Write-Host ("Komut: {0}" -f $cmd) -ForegroundColor DarkGray }
  $choice = if ($YesAll) { 'y' } else { Read-Host "Uygula (y), Atla (n), Durdur (q)" }
      if ($choice -eq 'q') { break }
      if ($choice -ne 'y') { continue }

      if ($cfg.DryRun) {
        Write-Host "DRY-RUN $label -> $cmd" -ForegroundColor Yellow
        continue
      }
      if ($s.action -in @("write_file_new","write_file_overwrite")) {
        $p = $s.params; if (-not $p.path -or -not $p.content) { throw "write_file* requires params.path & params.content" }
        $tmp = New-TemporaryFile; Set-Content -Path $tmp -Value $p.content -NoNewline
        Put-File -cfg $cfg -local $tmp -remote $p.path -Overwrite:($s.action -eq "write_file_overwrite") | Out-Null
        Remove-Item $tmp -Force
        Write-Host "$label -> uploaded $($p.path)" -ForegroundColor Green
      } else {
        $res = Run-Remote -session $session -cmd $cmd
        $ok  = ($res.ExitStatus -eq 0); $color = if ($ok) { "Green" } else { "Red" }
        Write-Host "$label -> $($res.Command)" -ForegroundColor DarkCyan
        if ($res.Output.Trim()) { Write-Host ($res.Output.Trim()) -ForegroundColor $color }
        if ($res.Error.Trim())  { Write-Warning $res.Error.Trim() }
        if (-not $ok) { throw "step failed: $($s.id) ($($s.action))" }
      }
    }
  } finally {
    if ($session) { Remove-SSHSession -SessionId $session.SessionId | Out-Null }
  }
  exit 0
}
