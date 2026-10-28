---
trigger: always_on
---

# Engineering standards

- Inspect the repository and relevant files before proposing implementation.
- Preserve the existing stack and working architecture unless a change is justified and approved.
- Make the smallest coherent change that satisfies the task.
- Do not claim a test, build, screenshot, or deployment succeeded unless it was actually run and the result was observed.
- Never expose, copy, or commit secrets. Do not inspect secret values unless directly required and explicitly authorized.
- Ask before destructive actions, production changes, dependency upgrades, database migrations, or broad refactors.
- Keep documentation concise and update it when architecture or workflows materially change.
- Read only the files relevant to the active task; do not load every document by default.
- For UI work, follow the existing design system or propose one before creating a new visual language.
- Verify responsive states and accessibility where applicable.
