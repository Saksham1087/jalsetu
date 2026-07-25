## Context

JalSetu is a React + Vite + Tailwind CSS v4 PWA with Firebase backend, Leaflet maps, and Groq AI chat. The app currently has a single light mode using a water/ocean palette (Deep Ocean `#0F2E35`, Teal Current `#127A7A`, Monsoon Sky `#E8EDF0`, etc.). All color classes are hardcoded as Tailwind utilities (e.g., `bg-white`, `text-gray-900`, `border-gray-200`).

Tailwind v4 supports dark mode via the `dark:` variant. By default it uses `prefers-color-scheme`, but the project needs class-based dark mode (`.dark` on `<html>`) to allow user toggle override. Tailwind v4 uses `@theme` to define design tokens and `@custom-variant dark` for class-based mode.

The app has 15+ components across citizen and admin views, each with hardcoded light-mode colors. The Leaflet map has inline HTML popups with hardcoded color values.

## Goals / Non-Goals

**Goals:**
- Dark/light mode toggle that persists across sessions (localStorage)
- Respect system `prefers-color-scheme` on initial visit
- All citizen components (Header, BottomNav, ComplaintCard, ComplaintDetail, FilterBar, ComplaintForm, ComplaintList, ChatWidget, PublicMap) render correctly in both modes
- All admin components (AdminLayout, AdminDashboard, AdminComplaints, AdminWards) render correctly in both modes
- Semantic CSS variables handle bulk color switching without per-component `dark:` classes
- Smooth transition (< 300ms) when switching themes
- One toggle button in the header

**Non-Goals:**
- No "system" option in toggle (just light/dark flip)
- No per-component dark mode customization
- No animation customization between themes
- Map tile layer stays the same (OSM light tiles)

## Decisions

1. **CSS Variable approach over `dark:` utilities**: Define semantic color tokens (e.g., `--color-card`, `--color-text-primary`) in `@theme` and override them under `.dark`. This avoids hundreds of `dark:` class additions across components. Only a few edge cases need explicit `dark:` utilities.

2. **Semantic token names over generic**: Use domain-meaningful names (`text-primary`, `text-body`, `card`, `surface`) instead of generic (`white`, `black`, `gray-100`) so the color system is auditable.

3. **Dark palette derived from ocean palette**: Dark mode backgrounds use very dark teal-blacks (`#0B171A` page, `#152426` card) rather than pure grays, keeping the water identity. Accent colors (teal, brass, emergency, resolved) are brightened slightly for dark-background contrast.

4. **localStorage + system preference**: On first visit, read `prefers-color-scheme`. On subsequent visits, use localStorage. The hook exposes `theme`, `toggleTheme`, and `isDark` for imperative use.

5. **Theme transition**: Apply `transition` on `background-color`, `color`, and `border-color` for a smooth crossfade when toggling. Respect `prefers-reduced-motion`.

6. **Leaflet popup**: Since popup content is inline HTML strings with hardcoded colors, dark mode for map popups is handled by overriding Leaflet CSS variables under `.dark` in `map.css`.

## Risks / Trade-offs

- **CSS variable override with `@property`**: Tailwind v4 registers `@property` for each `@theme` token. `.dark` overrides must be on `<html>` (same element as `:root`) to work. Verified: `.dark` class has higher specificity than `:root` type selector, so cascade handles it.
- **Leaflet inline styles**: Map popup HTML uses inline `style` attributes with hardcoded `#color` values. These can't be overridden by CSS variables. Mitigation: Accepted compromise — popup content stays light. Only the popup container background and controls get dark mode treatment.
- **Third-party widget (Cloudinary)**: The Cloudinary upload widget renders in its own isolated iframe. Cannot be themed. Mitigation: Not a concern — it's a transient modal.
- **Image backgrounds**: `bg-\[url\(...\)\]` for select dropdown arrows uses hardcoded SVG fill (`%233d4a4d`). Mitigation: The select arrows stay dark in dark mode. Acceptable for now.
