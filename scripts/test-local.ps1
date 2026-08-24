[CmdletBinding()]
param([int]$Port = 8787)

$health = Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 10
if ($health.status -ne 'ok') {
    throw 'Health check failed.'
}
Write-Output "Health check passed for $($health.service) $($health.version)."
