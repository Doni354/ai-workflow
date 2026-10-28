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

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ManifestName = '.doni-ai-workflow-manifest.json'

function Get-ProfileSkills([string]$Name) {
    switch ($Name) {
        'base' { return @('project-onboarding','documentation','verification') }
        'frontend' { return @('project-onboarding','documentation','verification','ui-implementation') }
        'backend' { return @('project-onboarding','documentation','verification','backend-feature') }
        'fullstack' { return @('project-onboarding','documentation','verification','ui-implementation','backend-feature') }
    }
}

function Resolve-TargetPath {
    if ($Scope -eq 'global') {
        return (Join-Path $HOME '.gemini\config')
    }
    if ([string]::IsNullOrWhiteSpace($Target)) { throw 'Target path cannot be empty.' }
    $resolved = [System.IO.Path]::GetFullPath($Target)
    if (-not (Test-Path -LiteralPath $resolved -PathType Container)) {
        throw "Workspace target does not exist: $resolved. Create/open the project first; installer will not create an arbitrary target."
    }
    $repo = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd('\','/')
    if ($resolved.TrimEnd('\','/') -eq $repo) {
        throw 'Target cannot be the workflow toolkit repository itself.'
    }
    return $resolved
}

function Install-File([string]$Source, [string]$Destination, [string]$Label) {
    if (-not (Test-Path -LiteralPath $Source -PathType Leaf)) {
        throw "Source file missing: $Source"
    }
    $exists = Test-Path -LiteralPath $Destination
    if ($DryRun) {
        $action = if ($exists) { 'CONFLICT: would ask before replacing' } else { 'CREATE' }
        Write-Host "[$action] $Label -> $Destination"
        return
    }
    if ($exists) {
        Write-Host "`nFile already exists: $Destination" -ForegroundColor Yellow
        Write-Host "[K] Keep existing  [B] Backup then replace  [S] Skip"
        $choice = Read-Host 'Choose K/B/S'
        if ($choice -match '^(K|k)$') { Write-Host "[KEEP] $Destination"; return }
        if ($choice -match '^(S|s)$') { Write-Host "[SKIP] $Destination"; return }
        if ($choice -notmatch '^(B|b)$') { Write-Host "[SKIP] Invalid choice: $Destination"; return }
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $backup = "$Destination.backup-$stamp"
        Copy-Item -LiteralPath $Destination -Destination $backup
        Write-Host "[BACKUP] $backup"
    }
    $parent = Split-Path -Parent $Destination
    if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    $script:InstalledPaths.Add($Destination)
    Write-Host "[INSTALLED] $Destination"
}

$InstalledPaths = [System.Collections.Generic.List[string]]::new()
$TargetRoot = Resolve-TargetPath
$skills = Get-ProfileSkills $Profile

if ($Scope -eq 'workspace') {
    $skillRoot = Join-Path $TargetRoot '.agents\skills'
    $ruleRoot = Join-Path $TargetRoot '.agents\rules'
    foreach ($skill in $skills) {
        $srcDir = Join-Path $RepoRoot "skills\$skill"
        if (-not (Test-Path -LiteralPath $srcDir -PathType Container)) { throw "Skill missing: $srcDir" }
        $destDir = Join-Path $skillRoot $skill
        Get-ChildItem -LiteralPath $srcDir -File -Recurse | ForEach-Object {
            $relative = $_.FullName.Substring($srcDir.Length).TrimStart('\','/')
            Install-File $_.FullName (Join-Path $destDir $relative) "skill:$skill"
        }
    }
    Install-File (Join-Path $RepoRoot 'rules\workspace\engineering-standards.md') (Join-Path $ruleRoot 'engineering-standards.md') 'workspace-rule'

    $docRoot = Join-Path $TargetRoot 'docs\ai-workflow'
    Get-ChildItem -LiteralPath (Join-Path $RepoRoot 'templates\docs') -File | ForEach-Object {
        Install-File $_.FullName (Join-Path $docRoot $_.Name) "documentation-template"
    }
    $manifestPath = Join-Path $TargetRoot $ManifestName
} else {
    $skillRoot = Join-Path $TargetRoot 'skills'
    $ruleRoot = Join-Path $TargetRoot 'rules'
    foreach ($skill in $skills) {
        $srcDir = Join-Path $RepoRoot "skills\$skill"
        $destDir = Join-Path $skillRoot $skill
        Get-ChildItem -LiteralPath $srcDir -File -Recurse | ForEach-Object {
            $relative = $_.FullName.Substring($srcDir.Length).TrimStart('\','/')
            Install-File $_.FullName (Join-Path $destDir $relative) "global-skill:$skill"
        }
    }
    Install-File (Join-Path $RepoRoot 'rules\global\engineering-standards.md') (Join-Path $ruleRoot 'doni-engineering-standards.md') 'global-rule'
    $manifestPath = Join-Path $TargetRoot 'doni-ai-workflow-global-manifest.json'
}

if (-not $DryRun) {
    $manifest = [ordered]@{
        toolkit = 'doni-ai-workflow'
        profile = $Profile
        scope = $Scope
        installedAt = (Get-Date).ToString('o')
        paths = @($InstalledPaths | Select-Object -Unique)
    }
    $manifestJson = $manifest | ConvertTo-Json -Depth 5
    if (Test-Path -LiteralPath $manifestPath) {
        $existingChoice = Read-Host "Manifest exists at $manifestPath. Merge newly installed paths into it? (y/N)"
        if ($existingChoice -match '^(y|yes)$') {
            try {
                $oldManifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
                $mergedPaths = @(@($oldManifest.paths) + @($InstalledPaths) | Select-Object -Unique)
                $manifest.paths = $mergedPaths
                $manifest.installedAt = (Get-Date).ToString('o')
                ($manifest | ConvertTo-Json -Depth 5) | Set-Content -LiteralPath $manifestPath -Encoding UTF8
            } catch {
                Write-Warning "Could not safely merge the existing manifest. It was left unchanged. Error: $($_.Exception.Message)"
            }
        } else {
            Write-Warning 'Manifest left unchanged. Newly installed files may not be tracked for uninstall; keep a note of the paths above.'
        }
    } else {
        $manifestJson | Set-Content -LiteralPath $manifestPath -Encoding UTF8
    }
    Write-Host "`nInstall finished. Review the paths above, then open Antigravity and inspect Customizations." -ForegroundColor Green
} else {
    Write-Host "`nDry run complete. No files were changed." -ForegroundColor Cyan
}
