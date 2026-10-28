---
name: project-onboarding
description: Onboards a new or existing repository. Audits the real codebase, identifies missing context, and proposes a safe plan before changing files. Use when starting a project, resuming an ongoing project, or when repository context is unclear.
---

# Project onboarding

## First classify
- New project: no meaningful application implementation exists yet.
- Ongoing project: source code, configuration, or deployment already exists.
- Unclear: inspect enough to classify; do not guess.

## Audit-only first pass
1. Inspect repository tree, README, package/dependency manifests, entry points, environment variable names (never values), and Git status.
2. Read existing project docs and relevant config. Avoid scanning build output, dependency folders, generated files, and secrets.
3. Identify stack, architecture, data stores, integrations, test/build commands, and deployment assumptions only when evidenced.
4. Separate verified facts, assumptions, risks, and unknowns.
5. Check `docs/ai-workflow/PROJECT_CONTEXT.md` if present; compare it with code.
6. Report findings and propose docs or tasks. Do not modify application code in the audit-only pass.

## Documentation safety
- Never overwrite an existing file without explicit approval.
- Prefer creating missing docs from `templates` only when available, or propose a concise document based on evidence.
- Do not fabricate architecture, schema, APIs, or test status.
- Do not copy secrets or sensitive data into documentation.
- Keep project context short; link to deeper docs instead of duplicating them.

## Next steps
After the user approves:
- Create or update only the selected documentation.
- Draft an implementation plan with scope, files likely affected, acceptance criteria, test strategy, and rollback notes.
- For new projects, confirm requirements and architecture before scaffolding large amounts of code.
- For ongoing projects, avoid broad refactors unless separately approved.
