# Liquid Glass — application UI preview

The shared material/runtime now applies across application UI, including portals,
buttons/links, select/dropdown backgrounds and items, chips, panels and dialogs.
Homepage layout refinements remain scoped through `ladi-home-glass` on AdminShell.
No product section or navigation item is added. Authored page content is excluded.
113 native selectors in 54 files use a shared glass adapter with their original
options and form handlers. See `src/components/liquid-glass/README.md` for maintenance.

The effect uses CSS backdrop filtering and an SVG alpha merge of two independently
settling drops. Text is outside the filtered layer. Animation frames stop when
the drops settle; effects and observers are cleaned up on unmount. Reduced motion
keeps the selected appearance without movement. Reduced transparency uses opaque
  surfaces. No GPU snapshot library or new dependency is loaded.

## Validation

- `rtk proxy pnpm exec tsc --noEmit`: passed.
- Glass module ESLint: no errors. Three existing homepage `<img>` warnings.
- The 54 selector files retain 145 pre-existing lint errors, matching HEAD;
  no new errors. Modal also retains its pre-existing set-state-in-effect error.
- `rtk proxy pnpm exec vitest run src/components/liquid-glass`: 18 passed,
  including native form/ref/reset and react-hook-form registration/blur/submit.
  Skeleton tests: 3 passed, including loading-state SSR/hydration.
- Visual checks at desktop 1440×1000, tablet 768×1024, mobile 390×844.
- No document horizontal overflow at those widths.
- Header retains its original controls and 52px height, with no added links.
- Long tool groups scroll horizontally. Mobile sidebar begins below the header.
- Tables scroll inside their own glass container; sample table content is 600px
  wide inside a 300px container at mobile size.
- Light/dark mode and selection changes were checked in the browser.

Screenshots use real components with isolated sample data, not account data.
The live application requires login; the local captcha API returned HTTP 500
during this review. Authentication was not changed. Actual iPhone Safari and
hardware performance still require device testing. All authenticated screens/API
flows have not been exercised end-to-end in this sample preview.

## Review

Hover consecutively over the existing tool selections: the leading drop pulls
toward the next item while the trailing drop follows and merges. Move out to
return to the selected item. Tap/click a control to see a ripple from the contact point. Use
Tab to test keyboard focus. Switch homepage tool selections and recent-list
buttons; swipe tool groups and tables on narrow screens.

Images: `desktop-light.jpg`, `desktop-dropdown.jpg`, `tablet-light.jpg`, `mobile-light.jpg`,
`mobile-dark.jpg`.

Latest refinement: a shared viewport gradient continues behind header/sidebar/content,
with lower light-mode tint and translucent chrome in both themes. Updated images:
`continuous-light.jpg`, `continuous-dark.jpg`, `continuous-mobile-light.jpg`,
`continuous-mobile-dark.jpg`. Desktop/tablet/mobile checked; header and mobile sidebar
offset stay 52px, without horizontal overflow.
