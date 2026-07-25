## Why

JalSetu is a daytime-use civic app, but users frequently browse complaints, check map data, and read status updates during evening hours. The current light-only theme causes eye strain in low-light environments and feels harsh at night. Adding dark/light mode reduces visual fatigue, improves readability in low-light conditions, and follows modern app conventions for user preference control.

## What Changes

- Add a persistent dark/light mode toggle with localStorage + system preference detection
- Define a full dark color token system derived from the existing water/ocean palette (not generic dark mode)
- Add theme toggle button to the header bar
- Update all components (citizen + admin) to respect the active theme
- Ensure Leaflet map popups and controls render correctly in dark mode
- Maintain all existing brand accent colors (teal, brass, emergency, resolved) with appropriate dark-background contrast

## Capabilities

### New Capabilities
- `theme-toggle`: Persistent dark/light mode with three-way detection (user preference → localStorage → system `prefers-color-scheme`), toggle button in header, CSS variable-based theming via `.dark` class on `<html>`

### Modified Capabilities

None — no existing specs to modify.

## Impact

- **CSS foundation**: `src/index.css` — add `.dark` class overrides for all semantic color tokens, add `@custom-variant dark` for Tailwind v4
- **New hook**: `src/hooks/useTheme.js` — theme state management with localStorage persistence
- **Header**: Add sun/moon toggle button next to sign-in
- **Components (12+)**: Add dark variants to color classes across all citizen and admin components
- **Map styles**: `src/styles/map.css` — Leaflet popup and control colors need dark mode awareness
- **No new dependencies** — leverages Tailwind v4's built-in dark mode variant
