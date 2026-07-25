## Why

Report and List tabs don't scroll on mobile. Content below viewport clipped by parent `overflow-hidden`. Form/list containers lack height constraint so `overflow-y-auto` never activates. Users can't reach submit button or see all complaints.

## What Changes

- Remove `overflow-hidden` from `<main>` in App.jsx
- Give scrollable tab containers (`ComplaintForm`, `ComplaintList`) `flex-1` height constraint so `overflow-y-auto` works
- Remove `min-h-screen` from ComplaintList (breaks flex sizing)
- Remove duplicated `pb-24` from `<main>` (each tab handles its own bottom nav clearance)

## Capabilities

### New Capabilities
- `scrollable-tabs`: Proper height propagation + overflow behavior for map/list/report tabs within flex layout

### Modified Capabilities
None — pure layout fix, no spec-level behavior changes

## Impact

- `src/App.jsx` — main wrapper classes
- `src/components/ComplaintForm.jsx` — outer container classes
- `src/components/ComplaintList.jsx` — outer container classes
- No API, dependency, or data changes
