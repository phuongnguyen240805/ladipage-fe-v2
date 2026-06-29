# Walkthrough

## 2026-06-27

- Added project-local Codex multi-agent configuration under `.codex/`.
- Added `explorer`, `reviewer`, and `docs_researcher` Codex agent roles.
- Added project-local `context7` and `playwright` MCP server entries for Codex.
- Documented ECC + Codex workflow expectations in `AGENTS.md`.
- Split Landing Page Builder into the dedicated `/builder/[pageId]` route group with a minimal builder layout.
- Added `src/features/landing-builder` wrappers, message protocol, client SDK, and server session helpers.
- Redirected legacy `/landing-pages/editor/[pageId]` traffic to `/builder/[pageId]`.
- Added builder APIs for session, draft page load/save, publish, HTML import, and upload reservation.
- Added public landing SDK routes and iframe runtime for embedding published pages without exposing `editor_data`.
- Kept `/p/[slug]` as the public runtime and added `?embed=1` resize messaging for SDK embeds.
- Split Landing Page Templates into `src/features/landing-templates` with admin/public/shared/sdk entry points.
- Added `/landing-pages/templates` admin entry, `/templates/[slug]` public template preview runtime, and public template SDK routes.
- Added public template APIs for single SDK config and gallery lists without exposing `editor_data` or `template_data`.
- Fixed imported/preserved HTML blocks in the landing builder to auto-fit their real rendered content height.
- Added iframe resize measurement for preserved HTML using `ResizeObserver`, `MutationObserver`, image load events, font readiness, and postMessage.
- Removed preserved HTML import height caps/default oversized canvas behavior so a single imported HTML block can drive the canvas height naturally.
