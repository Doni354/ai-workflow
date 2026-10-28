---
name: ui-implementation
description: Plans and implements UI with a coherent design system, responsive behavior, accessibility, and visual verification. Use for new screens, UI refinement, design-system work, or fixing visual inconsistencies.
---

# UI implementation

## Before coding
1. Inspect existing framework, components, styles, tokens, and one representative screen.
2. Read `docs/ai-workflow/design-system.md` if present; otherwise infer existing conventions and propose a minimal design system.
3. Identify user goal, content hierarchy, key states, and responsive behavior.
4. If a visual reference exists, use it as the primary direction; do not imitate unrelated reference details.
5. Propose a short plan for multi-component changes.

## Implementation
- Reuse existing components and dependencies where reasonable.
- Define consistent tokens for color, typography, spacing, radius, borders, elevation, and focus states.
- Avoid generic UI filler: excessive cards, gradients, arbitrary icons, repetitive badges, and decorative elements with no purpose.
- Use realistic content and meaningful empty, loading, error, and success states.
- Keep semantic HTML, keyboard navigation, visible focus, and accessible labels.
- Preserve API contracts and business logic while changing presentation.
- Do not rewrite unrelated screens or introduce a second design system.

## Visual verification
1. Run the project using its documented command when possible.
2. Inspect actual rendered output using available browser/screenshot tools.
3. Check at least one desktop and one narrow viewport when responsive behavior matters.
4. Check console/runtime errors and key interactions when tools are available.
5. Fix the highest-impact visible defects first: hierarchy, spacing, alignment, typography, overflow, responsive layout.
6. If visual verification is unavailable, state that limitation and provide exact manual checks.

## Completion report
Summarize changed components, design decisions, verification actually performed, and known gaps. Never claim visual QA passed without inspecting rendered output.
