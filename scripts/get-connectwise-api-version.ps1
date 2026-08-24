[CmdletBinding()]
param(
    [string]$ApiBaseUrl,
    [string]$ResultPath,
    [switch]$SelfTest
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertFrom-SecureInput {
    param([Parameter(Mandatory)][Security.SecureString]$Value)

    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Resolve-ApiBaseUri {
    param([Parameter(Mandatory)][string]$Value)

    $uri = $null
    if (-not [Uri]::TryCreate($Value.Trim(), [UriKind]::Absolute, [ref]$uri)) {
        throw 'The PSA API base URL is not a valid absolute URL.'
    }
    if ($uri.Scheme -ne 'https') {
        throw 'The PSA API base URL must use HTTPS.'
    }
    if ($uri.UserInfo -or $uri.Query -or $uri.Fragment -or $uri.AbsolutePath -ne '/') {
        throw 'Enter only the PSA API origin, for example https://api-na.myconnectwise.net.'
    }

    [Uri]$uri.GetLeftPart([UriPartial]::Authority)
}

function Get-VersionEvidence {
    param(
        [Parameter(Mandatory)]$Headers,
        [string]$Content
    )

    $headerNames = if ($Headers -is [Collections.IDictionary]) {
        @($Headers.Keys)
    }
    elseif ($null -ne $Headers.AllKeys) {
        @($Headers.AllKeys)
    }
    else {
        @()
    }

    foreach ($name in $headerNames) {
        if ([string]$name -match '(?i)(api.*version|version.*api)') {
            [pscustomobject]@{
                Source = 'response header'
                Name   = [string]$name
                Value  = [string]$Headers[$name]
            }
        }
    }

    if ([string]::IsNullOrWhiteSpace($Content)) {
        return
    }

    try {
        $body = $Content | ConvertFrom-Json
        foreach ($name in @('apiVersion', 'version', 'codebaseVersion', 'codebase')) {
            $property = $body.PSObject.Properties[$name]
            if ($null -ne $property -and $null -ne $property.Value) {
                [pscustomobject]@{
                    Source = 'response body'
                    Name   = $name
                    Value  = [string]$property.Value
                }
            }
        }
    }
    catch {
        return
    }
}

function Write-SanitizedResult {
    param(
        [string]$Path,
        [bool]$RequestSuccessful,
        [AllowNull()][Nullable[int]]$StatusCode,
        [object[]]$Evidence = @()
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }
    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
        throw 'The result directory does not exist.'
    }

    [ordered]@{
        timestampUtc      = [DateTime]::UtcNow.ToString('o')
        requestSuccessful = $RequestSuccessful
        httpStatus        = $StatusCode
        versionEvidence   = @($Evidence | ForEach-Object {
                [ordered]@{
                    source = $_.Source
                    name   = $_.Name
                    value  = $_.Value
                }
            })
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $Path -Encoding UTF8
}

if ($SelfTest) {
    $resolved = Resolve-ApiBaseUri 'https://api-na.myconnectwise.net/'
    if ($resolved.AbsoluteUri -ne 'https://api-na.myconnectwise.net/') {
        throw 'Self-test failed: URL normalization.'
    }
    try {
        Resolve-ApiBaseUri 'http://api-na.myconnectwise.net/' | Out-Null
        throw 'Self-test failed: insecure URL accepted.'
    }
    catch {
        if ($_.Exception.Message -notmatch 'must use HTTPS') {
            throw
        }
    }
    $evidence = @(Get-VersionEvidence -Headers @{ 'api-current-version' = 'test-version' } -Content '{"version":"test-version"}')
    if ($evidence.Count -ne 2 -or @($evidence.Value) -notcontains 'test-version') {
        throw 'Self-test failed: version extraction.'
    }
    Write-Output 'Self-test passed.'
    return
}

if ([string]::IsNullOrWhiteSpace($ApiBaseUrl)) {
    $ApiBaseUrl = Read-Host 'PSA API base URL (origin only)'
}

$baseUri = Resolve-ApiBaseUri $ApiBaseUrl
$endpoint = [Uri]::new($baseUri, '/v2025_1/apis/3.0/system/info')
Write-Output ("Target host: {0}" -f $baseUri.Host)
Write-Output ("Target endpoint: {0}" -f $endpoint.AbsoluteUri)
if ((Read-Host 'Send one authenticated read-only request? Type YES') -cne 'YES') {
    Write-Output 'Cancelled. No request was sent.'
    exit 1
}

$companyInput = Read-Host 'Company ID' -AsSecureString
$publicKeyInput = Read-Host 'Public API key' -AsSecureString
$privateKeyInput = Read-Host 'Private API key' -AsSecureString
$clientIdInput = Read-Host 'Integration Client ID' -AsSecureString

$authBytes = $null
$headers = $null
try {
    $company = ConvertFrom-SecureInput $companyInput
    $publicKey = ConvertFrom-SecureInput $publicKeyInput
    $privateKey = ConvertFrom-SecureInput $privateKeyInput
    $clientId = ConvertFrom-SecureInput $clientIdInput
    if (@($company, $publicKey, $privateKey, $clientId).Where({ [string]::IsNullOrWhiteSpace($_) }).Count -gt 0) {
        throw 'All credential prompts require a value.'
    }

    $authBytes = [Text.Encoding]::UTF8.GetBytes("${company}+${publicKey}:$privateKey")
    $headers = @{
        Authorization = 'Basic ' + [Convert]::ToBase64String($authBytes)
        clientId      = $clientId
        Accept        = 'application/vnd.connectwise.com+json'
    }

    if ($PSVersionTable.PSVersion.Major -lt 6) {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    }

    $request = @{
        Uri                = $endpoint
        Method             = 'Get'
        Headers            = $headers
        TimeoutSec         = 30
        MaximumRedirection = 0
        ErrorAction        = 'Stop'
    }
    if ($PSVersionTable.PSVersion.Major -lt 6) {
        $request.UseBasicParsing = $true
    }

    $response = Invoke-WebRequest @request
    Write-Output ("HTTP status: {0}" -f [int]$response.StatusCode)
    $evidence = @(Get-VersionEvidence -Headers $response.Headers -Content $response.Content)
    Write-SanitizedResult -Path $ResultPath -RequestSuccessful $true -StatusCode ([int]$response.StatusCode) -Evidence $evidence
    if ($evidence.Count -eq 0) {
        Write-Output 'API version: not returned by this endpoint.'
        exit 2
    }
    foreach ($item in $evidence) {
        Write-Output ("Version evidence [{0}] {1}: {2}" -f $item.Source, $item.Name, $item.Value)
    }
}
catch {
    $statusCode = $null
    if ($null -ne $_.Exception.Response -and $null -ne $_.Exception.Response.StatusCode) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    try {
        Write-SanitizedResult -Path $ResultPath -RequestSuccessful $false -StatusCode $statusCode
    }
    catch {
        Write-Warning 'The sanitized result file could not be written.'
    }
    if ($null -ne $statusCode) {
        Write-Error "Request failed with HTTP $statusCode. No credentials were stored or displayed."
    }
    else {
        Write-Error 'Request failed before a response was received. No credentials were stored or displayed.'
    }
    exit 1
}
finally {
    if ($null -ne $authBytes) {
        [Array]::Clear($authBytes, 0, $authBytes.Length)
    }
    if ($null -ne $headers) {
        $headers.Authorization = $null
        $headers.clientId = $null
    }
    foreach ($secureValue in @($companyInput, $publicKeyInput, $privateKeyInput, $clientIdInput)) {
        if ($null -ne $secureValue) {
            $secureValue.Dispose()
        }
    }
    Remove-Variable company, publicKey, privateKey, clientId, response -ErrorAction SilentlyContinue
}
