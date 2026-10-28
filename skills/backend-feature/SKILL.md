---
name: backend-feature
description: Implements backend features while preserving existing architecture, API contracts, data integrity, validation, authorization, and observability. Use for API endpoints, business logic, database changes, or server integrations.
---

# Backend feature workflow

1. Inspect the relevant route/controller/service/data-access files and existing patterns.
2. Confirm the expected behavior and acceptance criteria. Identify auth, validation, failure modes, and data ownership.
3. Check existing API contracts and schema before proposing changes.
4. Plan the smallest change; identify migration/backward-compatibility risks.
5. Validate input on the server; do not rely only on frontend validation.
6. Apply authorization at the data/action boundary. Do not trust client-supplied identity or role claims without verification.
7. Avoid logging secrets, tokens, or unnecessary personal data.
8. Reuse project error handling, logging, and response conventions.
9. Test success, validation failure, authorization failure, and relevant edge cases.
10. Do not run destructive migrations or touch production resources without explicit approval.
11. Report files changed, tests actually run, and remaining risks.
