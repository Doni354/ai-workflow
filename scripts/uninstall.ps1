[CmdletBinding()]
param(
    [string]$Target = (Get-Location).Path,
    [ValidateSet('workspace','global')]
    [string]$Scope = 'workspace',
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$manifestName = if ($Scope -eq 'workspace') { '.doni-ai-workflow-manifest.json' } else { 'doni-ai-workflow-global-manifest.json' }

if ($Scope -eq 'global') {
    $root = Join-Path $HOME '.gemini\config'
} else {
    $root = [System.IO.Path]::GetFullPath($Target)
    if (-not (Test-Path -LiteralPath $root -PathType Container)) { throw "Target directory does not exist: $root" }
}
$manifestPath = Join-Path $root $manifestName
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Manifest not found: $manifestPath. Nothing removed; install with this toolkit version first or remove files manually after reviewing them."
}
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
foreach ($path in $manifest.paths) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-Host "[MISSING] $path"
        continue
    }
    $choice = 'N'
    if (-not $DryRun) {
        $choice = Read-Host "Remove installed file? $path (y/N)"
    }
    if ($DryRun) {
        Write-Host "[DRY RUN] Would ask before removing $path"
    } elseif ($choice -match '^(y|yes)$') {
        Remove-Item -LiteralPath $path
        Write-Host "[REMOVED] $path"
    } else {
        Write-Host "[KEPT] $path"
    }
}
if ($DryRun) {
    Write-Host '[DRY RUN] Would ask whether to remove manifest.'
} else {
    $removeManifest = Read-Host "Remove install manifest $manifestPath? (y/N)"
    if ($removeManifest -match '^(y|yes)$') { Remove-Item -LiteralPath $manifestPath }
}
Write-Host 'Uninstall pass complete. Empty directories are intentionally left in place.'
