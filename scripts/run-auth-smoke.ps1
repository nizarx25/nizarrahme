# Auth smoke test: boot dev server, run auth flow, kill server.
$ErrorActionPreference = 'Stop'

$env:DATABASE_URL = 'file:./prisma/dev.db'
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:ALLOW_ADMIN_BOOTSTRAP = 'true'
$env:ADMIN_BOOTSTRAP_EMAIL = 'admin@nizarrahme.com'
$env:ADMIN_BOOTSTRAP_PASSWORD = 'TestPassword123Secure'

Set-Location 'c:\Users\NIZAR RAHME\Desktop\WebSites-domain\nizarrahme.com'

Write-Output 'Starting dev server...'
$proc = Start-Process -FilePath 'node' `
  -ArgumentList 'node_modules\next\dist\bin\next','dev','-p','3500' `
  -PassThru -NoNewWindow `
  -RedirectStandardOutput 'smoke.log' `
  -RedirectStandardError 'smoke-err.log'

try {
  Start-Sleep -Seconds 25
  Write-Output 'Running smoke test...'
  node scripts/smoke-auth.mjs
  Write-Output 'Smoke test passed.'
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Get-Process -Name 'node' -ErrorAction SilentlyContinue |
    Where-Object { $_.StartTime -gt (Get-Date).AddMinutes(-2) } |
    Stop-Process -Force -ErrorAction SilentlyContinue
  Remove-Item smoke.log, smoke-err.log -ErrorAction SilentlyContinue
}
