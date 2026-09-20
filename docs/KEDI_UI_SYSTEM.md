# Kedi.Media Product UI System

This document defines the implementation rules introduced by the Kedi.Media UX/UI system patch. It complements the marketing/brand guideline and focuses on product UI behavior.

## 1. Brand hierarchy

- Primary product color: Kedi Navy `#0B2D5B`.
- Accent/highlight color: Kedi Yellow `#FFC629`.
- Product surfaces: white and neutral gray/blue-gray.
- Yellow is an accent, not the default text/background pair for primary product controls.
- Never place normal white text on Kedi Yellow. Use Kedi Navy/dark text instead.
- Expanded navigation uses the official Kedi.Media logo lockup. Collapsed navigation uses the Kedi icon.

## 2. Interaction hierarchy

Use one dominant action per page or decision area.

- `Button variant="primary"`: default product action, Navy background / white text.
- `Button variant="accent"`: selective brand emphasis, Yellow background / Navy text.
- `Button variant="outline"`: secondary action.
- `Button variant="ghost"`: low-emphasis utility action.
- `Button variant="danger"`: destructive action only.

All interactive controls must expose a visible `focus-visible` state and must not rely on color alone to communicate status.

## 3. Typography

Persistent product UI should not use text below 12px except for intentionally non-essential visualization labels. The global product defaults are designed around a 14px body scale.

Recommended hierarchy:

- Page title: 24/32, semibold.
- Section title: 18/28, semibold.
- Card title: 16/24, medium or semibold.
- Body: 14/20.
- Label: 13/18.
- Metadata: 12/18.

## 4. Color tokens

Use Kedi tokens rather than generic colors for brand meaning:

- `kedi-navy`: Kedi primary dark.
- `brand-*`: Kedi Yellow scale and brand interaction scale.
- semantic status colors remain status-specific (success, warning, danger, info).

Do not redefine generic Tailwind colors such as `black` or `lime` as Kedi brand aliases. This keeps third-party/specialized workspaces predictable and prevents semantic collisions.

Use only standard neutral numeric shades (`50, 100, 200, ... 950`, plus the existing `gray-25` token where needed). Arbitrary pseudo-shades such as `gray-150`, `gray-850`, or `slate-855` are not allowed.

## 5. Navigation architecture

The primary sidebar represents user jobs, not every installed feature variation.

Core work:

- Tổng quan
- Landing Page
- Bán hàng
- Khách hàng
- Chăm sóc khách hàng
- Kedi Work
- Automation
- Báo cáo

Installed applications appear in the application group using Kedi naming. A destination should not be duplicated under a second navigation label.

The global header is a productivity bar. Global search / command navigation is available with `Cmd/Ctrl + K`.

## 6. Product naming

Customer-facing module names follow `Kedi + capability` where appropriate, for example Kedi Ads, Kedi Sales, Kedi Learning, Kedi SEO and Kedi Analytics. External platform names such as Facebook or Meta are retained when they describe an external platform rather than a Kedi product.

Legacy identifiers may remain internally when changing them would break API contracts, persisted data, route compatibility or test fixtures. They must not leak into customer-facing labels.

## 7. Dashboard principles

The dashboard is a control center, not a product catalog. Prioritize:

1. Current status and greeting.
2. Next actions / onboarding progress.
3. Business KPIs.
4. Active work.
5. Items requiring attention.
6. Contextual Kedi recommendations.

Claims shown in product UI must be backed by measured product/account data or clearly qualified.

## 8. Automated guard

Run:

```bash
pnpm quality:ui
```

The guard rejects common regressions introduced during incremental migration, including:

- undefined/nonstandard gray or slate shades;
- generic `lime-*` brand aliases;
- white text on base Kedi Yellow/brand Yellow backgrounds;
- redefinition of generic black/lime tokens in the global theme.

Run this check with lint and build in CI.

## 9. Migration rule

Do not restyle isolated pages by introducing new one-off tokens. New and touched screens should move toward shared primitives and the product shell. Specialized workspaces may keep task-specific density/layout, but inherit the Kedi foundation for typography, controls, focus, brand identity and interaction states.
