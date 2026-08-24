[CmdletBinding()]
param([switch]$Show)

$bytes = [byte[]]::new(32)
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$token = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

if ($Show) {
    Write-Output $token
}
else {
    Set-Clipboard -Value $token
    Write-Output 'A new MCP bearer token was copied to the clipboard. Paste it into MCP_SERVER_BEARER_TOKEN in the local .env file.'
}

[Array]::Clear($bytes, 0, $bytes.Length)
$token = $null
