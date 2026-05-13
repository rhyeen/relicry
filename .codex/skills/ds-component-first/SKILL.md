---
name: ds-component-first
description: Use when Codex is modifying or creating frontend UI in a codebase with an existing design system or DS component library. Trigger for requests that mention DS components, design-system consistency, moving custom styles/raw HTML into components, refactoring pages to match existing app patterns, updating existing DS components for new UI paradigms, creating new reusable DS components, or deciding when custom module CSS is acceptable for highly specific one-off UI.
---

# DS Component First

## Core Rule

Build UI from the app's design-system components first. Treat raw HTML elements, custom module CSS, and one-off component styling as exceptions that need a reason.

When a custom pattern appears likely to be reused, promote it into the design system before copying it elsewhere.

## Workflow

1. Inspect nearby finished pages and existing DS components before editing.
   - Look for pages the user cites as the standard.
   - Search for `components/ds`, shared client components, page action helpers, form wrappers, layout primitives, and preview/list components.
   - Prefer local component APIs and page structure over inventing new markup.

2. Map the requested UI to existing DS primitives.
   - Use DS layout, section, typography, form, input, select, button, grid, card, loading, empty, and action components when available.
   - Use existing admin-gated action components, page shells, toolbar patterns, and browser/list clients when they exist.
   - Avoid raw `div`, `button`, `input`, `select`, `h*`, and `p` elements in app pages unless the element is genuinely custom or wrapped by a DS component.

3. Extend DS components when the desired UI is a general capability.
   - Add small, backwards-compatible props for common variants, states, density, icons, disabled/loading behavior, actions, responsive columns, or tone.
   - Preserve existing call sites and visual language.
   - Add the new behavior where the DS component owns the concept, not as local page CSS.

4. Create a new DS component when a pattern repeats or will obviously repeat.
   - Good candidates: filters/toolbars, page actions, empty states, preview cards, status badges, search/pagination controls, metadata rows, and admin visibility wrappers.
   - Keep the API narrow and semantic. Name props for product meaning instead of CSS mechanics where possible.
   - Put reusable styling inside the DS component, then replace local copies with that component.

5. Allow custom module CSS only for exceptional, domain-specific UI.
   - Accept custom styling for unusually visual, one-off, or highly tailored elements: game boards, card art compositions, bespoke previews, canvas/3D scenes, or layouts that would make the DS worse if generalized too early.
   - Keep custom CSS scoped and small.
   - If the same custom styling is reused later, stop and extract a DS component first instead of copy/pasting the CSS.

6. Verify consistency.
   - Run the repo's relevant lint/test/build commands.
   - For frontend changes, inspect the page in the browser when practical.
   - Check responsive layout, loading/empty states, disabled states, role-gated actions, and whether text fits.

## Refactor Heuristics

- If a page already has many DS-only sibling pages, match their structure even if the visual design must simplify slightly.
- If using DS components would require a small DS improvement, make that improvement instead of bypassing DS locally.
- If a one-off design becomes a second usage, it is no longer one-off.
- Do not preserve custom styling just because it already exists. Preserve it only when it is still the right abstraction boundary.
- Avoid creating broad "god components." Prefer a focused DS primitive or composition that solves the repeated pattern.

## Review Checklist

Before finishing, confirm:

- App/page files use DS components for layout, text, forms, controls, and actions.
- Raw HTML remains only where it is part of a custom visual surface or inside DS/component internals.
- New DS props or components are reusable and do not encode one page's incidental details.
- Custom module CSS has a clear one-off justification.
- Reused custom UI has been promoted into DS rather than duplicated.
