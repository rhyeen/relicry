---
name: relicry-gallery-ui
description: Relicry-specific UI guidance for gallery/list pages, art and artist archive pages, card browser filters, URL-backed search params, design-system actions, and browser visual validation. Use when Codex edits Relicry /art, /art/[id], /ast/[id], /cards, gallery grids, filter dialogs, featured art, mini galleries, or related tests.
---

# Relicry Gallery UI

Use this skill to make Relicry gallery and archive interfaces feel like designed product surfaces rather than database views. Preserve behavior first, then improve presentation, and always validate visual work in the browser.

## Workflow

1. Inspect the current implementation before editing. Start with the page/component, its filter helpers, tests, and local CSS modules.
2. Keep the URL as the source of truth for list filters. Parse incoming search params, seed the client state from them, and update the URL when filters are applied, cleared, or paginated.
3. Put page-level status and actions in the top `DSSection.Card`, using `DSSection.Actions` and `DSButton` for actions such as Filters, Back, Reference source, View all art, and pagination controls.
4. Keep dense filtering controls inside a `DSDialog` rather than visible as a toolbar. The dialog should include the existing filter capabilities and an Apply/Clear flow.
5. Prefer native `DSSelect` behavior inside dialogs. Do not reintroduce portaled select menus unless the modal stacking and focus behavior are explicitly solved and tested.
6. Add or update focused tests for filter parsing, URL serialization, pagination, hidden/visible featured sections, badges, and filtered-result behavior.
7. Run focused tests plus `npm run build` when the UI behavior changes. Run broader tests when shared helpers or cross-page contracts change.
8. Validate the finished UI in the in-app browser. Check desktop and mobile, the filter dialog, select controls, filtered and unfiltered URLs, and whether spacing, type, badges, and image proportions look clean.

## URL-Backed Filters

For `/art`, preserve these conventions:

- Represent filters with an `ArtListFilters`-style object that includes `query`, `artistId`, `type`, `generation`, and `page`.
- Serialize `page` only when it is greater than `1`.
- Keep search params stable across Apply, Clear, and pagination. Clear should return to the unfiltered gallery route.
- When `artistId` is present in the URL, show it in the filter dialog and apply it when fetching/filtering. Links from artist pages should use `/art?artistId=[id]`.
- Preserve the existing search capabilities: title, artist name, art ID, bare ID, artist ID, type, and generation. If a backend query would require a new composite index, prefer the existing in-memory/expanded-search pattern unless the user asks for backend changes.

For `/cards`, use the same visible pattern:

- Place the Filters button and result/page summary in the top card.
- Keep card-specific search controls in the dialog.
- Let dialog Apply/Clear update URL params instead of maintaining hidden state that diverges from the URL.

## Gallery Pattern

For `/art`, keep the gallery visual model:

- Use a 22-item page window when following the current gallery design.
- On unfiltered pages, feature exactly two illustration items from the current page. Remove those items from the grid so the page shows two featured pieces plus twenty grid items.
- If fewer than two illustration items are available on that page, hide the featured section entirely.
- Hide featured art whenever search, artist, type, or generation filters are active.
- Featured art should be image-led, borderless, slightly rounded, and use a subtle bottom vignette with readable overlaid title/artist text.
- Show an `AI` badge on featured and grid items only for AI-generated art, styled consistently with the small badge language used on `/cards`.
- Grid items should be minimal vertical tiles. Put the title on the image surface or writing surface, keep it to one line with ellipsis, and avoid table-like metadata.
- Illustration grid media should be square and larger than old preview-table art.
- Writing tiles should look intentional, not like missing images. Use a manuscript/editorial treatment with richer text scale, rhythm, and contrast instead of a black empty-looking card with tiny description text.
- Use responsive grid breakpoints that shift from two columns to one close to `640px`, and verify no text overlaps on mobile.

## Detail Pages

For `/art/[id]`, design around the art type:

- Fetch and display the artist name when available, and link it to the artist page.
- Use `DSPage`, `DSSection`, `DSSection.Card`, `DSSection.Actions`, badges, and existing design-system primitives rather than one-off action markup.
- For illustration art, prioritize a large image stage with supporting metadata nearby: title, artist, type/generation badges, archive ID, description, and source/reference action when available.
- For writing art, make the writing itself feel like the primary artifact. Use a readable manuscript/article area, strong title treatment, artist link, description or excerpt, and restrained metadata.
- Put navigation and external actions such as Back to gallery and Reference source in `DSSection.Actions` with `DSButton`.
- Keep markdown text color inheriting from the surrounding designed surface when the detail page provides its own treatment.

For `/ast/[id]`, use the artist profile pattern:

- Build a styled hero from the artist record: display name, image/banner when available, initials fallback, artist ID, tags or metadata if present.
- Add a `View all art` `DSButton` linking to `/art?artistId=[id]`.
- Show a mini gallery of up to three of the artist's art pieces.
- If the page mixes cached/static shell data with uncached art queries, split the page into server-rendered sections behind `Suspense` as needed for Next cache-component constraints.
- Prefer server-rendered mini-gallery tiles over importing client gallery components into server pages unless interactivity is required.

## Files To Inspect

Useful starting points in the Relicry repo:

- `src/lib/artList.ts`
- `src/lib/artList.test.ts`
- `src/app/(with-header)/art/page.tsx`
- `src/app/(with-header)/art/ArtBrowserClient.tsx`
- `src/app/(with-header)/art/ArtToolbar.tsx`
- `src/app/(with-header)/art/[id]/page.tsx`
- `src/app/(with-header)/ast/[id]/page.tsx`
- `src/app/(with-header)/cards/CardsBrowserClient.tsx`
- `src/app/(with-header)/cards/CardsToolbar.tsx`
- `src/components/ArtPreviewItem.tsx`
- `src/components/ds/DSSelect.tsx`
- `src/components/ds/DSDialog.tsx`

## Validation Checklist

Before calling a gallery/detail redesign done:

- Run focused tests for the changed page/helpers.
- Run `npm run build`.
- Open the affected route in the in-app browser.
- Check an unfiltered gallery page and at least one filtered URL.
- Open the filter dialog and change native selects in the dialog.
- Check desktop and mobile widths.
- Confirm featured art rules, badge placement, grid proportions, dialog fit, and pagination.
- Confirm URL params reflect the applied filters and that Clear removes them.
- For detail pages, inspect an illustration example and a writing example when both types are affected.
