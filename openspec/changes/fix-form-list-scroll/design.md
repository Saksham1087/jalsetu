## Context

App uses a single `<main>` flex container for all tabs. `<main>` has `overflow-hidden` which was added to clip the map (PublicMap uses `absolute inset-0`). Scrollable tabs (ComplaintForm, ComplaintList) each have `overflow-y-auto` on their outer divs, but lack height constraint — a div with unbounded height never overflows.

ComplaintList also uses `min-h-screen` on its outer div, forcing viewport height independent of flex sizing.

## Goals / Non-Goals

**Goals:**
- Each tab properly fills available viewport height
- Scrollable tabs scroll when content exceeds viewport
- Bottom nav clearance handled per-tab, not on parent

**Non-Goals:**
- No visual redesign
- No behavior changes for the map tab
- No touch-target or responsive fixes (separate concern)

## Decisions

**Decision 1: Remove `overflow-hidden` from `<main>`**
The map uses `absolute inset-0` and won't overflow its own container. The `relative` on main already establishes positioning context. Removing `overflow-hidden` lets children manage their own overflow. Alternative was conditional overflow via a wrapper per tab — over-engineered for this case.

**Decision 2: Give scrollable tabs `flex-1` + `overflow-y-auto`**
Inside a `<main flex flex-col>`, each child needs `flex-1` to be height-constrained. Once constrained, `overflow-y-auto` creates a proper scroll container. Alternative was JS-based height calculation — fragile and unnecessary.

**Decision 3: Remove `pb-24` from `<main>`, keep on children**
`pb-24` on main adds dead space at the bottom of all tabs (including map). Better to let each tab handle its own bottom nav clearance. Map overlays use their own absolute positioning (e.g., `bottom-24` for filter toggle). Alternative was keeping `pb-24` on main — would leave dead space.

## Risks / Trade-offs

- Map overlays currently rely on main's `pb-24` indirectly — but they use absolute positioning within the map container, not the main. Verified: filter toggle uses `bottom-24 right-4` relative to map container, not main. No impact.
- Removing `min-h-screen` from ComplaintList changes its loading state sizing. Loading state also uses `min-h-screen` on a separate wrapper — that needs the same fix.
