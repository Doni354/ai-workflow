# doni-ai-workflow

Reusable, modular engineering workflow for Google Antigravity IDE. Designed for both new and existing repositories, with special care for existing files and low-context AI sessions.

## Features
- Workspace or global skill installation.
- Profiles: `base`, `frontend`, `backend`, `fullstack`.
- Workspace documentation templates under `docs/ai-workflow/`.
- Existing-file conflict prompts; no silent overwrites.
- Backups before replacement.
- Dry-run mode.
- Uninstall only removes files recorded in the install manifest and asks before deleting modified files.
- Ongoing-project onboarding skill audits first; it does not authorize automatic refactors.

## Requirements
- Windows PowerShell 5.1 or PowerShell 7.
- Antigravity IDE.
- Download/clone this repository before running scripts.
- Review scripts before running them.

## Install into a workspace

```powershell
.\scripts\install.ps1 -Target "D:\Project\MyApp" -Profile fullstack -Scope workspace -DryRun
.\scripts\install.ps1 -Target "D:\Project\MyApp" -Profile fullstack -Scope workspace
```

For a global installation of reusable skills and global rules:

```powershell
.\scripts\install.ps1 -Profile base -Scope global -DryRun
.\scripts\install.ps1 -Profile base -Scope global
```

Global installs do not install project documentation templates. Workspace scope installs skills, rules, and documentation templates.

## Profiles
- `base`: project onboarding, documentation, verification.
- `frontend`: base + UI implementation.
- `backend`: base + backend feature workflow.
- `fullstack`: all included skills.

## Existing projects
1. Run installer with `-DryRun`.
2. Review the proposed destinations.
3. Run without `-DryRun`.
4. Open the project in Antigravity.
5. Invoke `/project-onboarding` and request an audit-only pass first.
6. Review generated docs and commit only what you approve.

The installer never runs AI or edits application source code. It only installs workflow assets. The onboarding skill guides the AI to inspect first and propose changes before applying them.

## Updating
Download the newer repository version and run:

```powershell
.\scripts\update.ps1 -Target "D:\Project\MyApp" -Profile fullstack -Scope workspace -DryRun
.\scripts\update.ps1 -Target "D:\Project\MyApp" -Profile fullstack -Scope workspace
```

The update script uses the same conflict prompts and backups as the installer. Files are not overwritten silently.

## Uninstall
```powershell
.\scripts\uninstall.ps1 -Target "D:\Project\MyApp" -Scope workspace -DryRun
.\scripts\uninstall.ps1 -Target "D:\Project\MyApp" -Scope workspace
```
The manifest records files installed by this toolkit. Uninstall skips modified files unless you explicitly approve removal. It does not remove project-generated documentation or source code.

## Paths used
Antigravity IDE workspace skills: `.agents/skills/<skill-name>/SKILL.md`
Antigravity IDE global skills: `~/.gemini/config/skills/<skill-name>/SKILL.md`
Workspace rules: `.agents/rules/*.md`
Global modular rules: `~/.gemini/config/rules/*.md`
Workspace docs templates: `docs/ai-workflow/`

## Safety notes
- Review PowerShell scripts before running them.
- Start with `-DryRun`.
- Commit or back up the project before onboarding.
- Do not put API keys, passwords, tokens, private user data, or production secrets into generated docs.
- This bundle has not been executed in the user's environment. Verify scripts locally before relying on them.
