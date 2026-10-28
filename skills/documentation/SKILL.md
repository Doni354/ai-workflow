---
name: documentation
description: Creates or updates concise project documentation based on verified repository evidence, without overwriting existing files without approval. Use for architecture, project context, data models, API contracts, or decision records.
---

# Documentation workflow

1. Identify the specific documentation need and inspect relevant source/config files.
2. Distinguish verified facts from assumptions and open questions.
3. Prefer small docs with links between them over a giant specification.
4. Never overwrite existing content without showing the conflict and asking.
5. Do not document secret values, credentials, private data, or speculative behavior as fact.
6. For architecture docs, capture boundaries and data flow rather than reproducing source code.
7. For data models, include entities/collections, key fields, relationships, validation, and unresolved questions only when supported by evidence.
8. For API docs, capture method, route, auth, request/response shape, errors, and source of truth when known.
9. Keep `PROJECT_CONTEXT.md` short: purpose, stack, entry points, docs, active task, verification commands, known risks.
10. End with a list of files created/changed and what remains unknown.
