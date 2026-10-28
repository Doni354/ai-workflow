[CmdletBinding()]
param(
    [string]$Target = (Get-Location).Path,
    [ValidateSet('base','frontend','backend','fullstack')]
    [string]$Profile = 'fullstack',
    [ValidateSet('workspace','global')]
    [string]$Scope = 'workspace',
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$installer = Join-Path $PSScriptRoot 'install.ps1'
if (-not (Test-Path -LiteralPath $installer)) { throw "Installer missing: $installer" }

Write-Host 'Update uses the same safe conflict flow as install. Existing files are never silently overwritten.' -ForegroundColor Cyan
$argsList = @{
    Target = $Target
    Profile = $Profile
    Scope = $Scope
}
if ($DryRun) { $argsList['DryRun'] = $true }
& $installer @argsList
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
