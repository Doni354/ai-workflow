---
name: verification
description: Verifies code changes using available lint, typecheck, test, build, and runtime checks. Use before marking a task complete or reviewing a change.
---

# Verification workflow

1. Read package/dependency manifests and project docs to identify valid commands.
2. Inspect the diff and ensure changes remain within the task scope.
3. Run the smallest relevant checks first (lint/typecheck/targeted tests), then broader checks when useful.
4. Never invent commands or claim checks passed without running them.
5. If a command cannot run, explain why and provide the exact command for the user.
6. For UI changes, use the UI implementation skill's visual verification checklist if available.
7. Inspect failures and distinguish pre-existing failures from regressions when evidence permits.
8. Do not automatically fix unrelated failures.
9. Report each check as passed, failed, skipped, or not available.
