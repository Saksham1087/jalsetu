## ADDED Requirements

### Requirement: Tab containers fill available viewport height
Each tab container SHALL use `flex-1` to fill the remaining height of the `<main>` flex container. The map tab SHALL continue using `relative flex-1 min-h-0 w-full`. The report and list tabs SHALL use `flex-1 overflow-y-auto` for their outer container.

#### Scenario: Report tab fills available space
- **WHEN** user taps "Report" in bottom nav
- **THEN** complaint form container fills remaining height between header and bottom nav
- **AND** vertical scrollbar appears when form content exceeds viewport

#### Scenario: List tab fills available space
- **WHEN** user taps "Complaints" in bottom nav
- **THEN** complaint list fills remaining height between header and bottom nav
- **AND** list scrolls independently when content overflows

### Requirement: No parent-level overflow clipping
The `<main>` container SHALL NOT have `overflow-hidden` set, so child scroll containers can operate independently.

#### Scenario: Scrollable content not clipped
- **WHEN** content in Report or List tab exceeds viewport height
- **THEN** scrollbar appears within the tab container
- **AND** content below fold is reachable via scroll

### Requirement: Bottom nav clearance handled per tab
Each tab SHALL include its own bottom padding (`pb-24`) for bottom nav clearance. The `<main>` container SHALL NOT include redundant `pb-24`.

#### Scenario: Form fields visible above bottom nav
- **WHEN** user scrolls to bottom of complaint form
- **THEN** last form field has 96px (pb-24) clearance before bottom nav

### Requirement: ComplaintList removes min-h-screen
ComplaintList outer container SHALL NOT use `min-h-screen` — this forces viewport height independent of flex container sizing.

#### Scenario: List fits within flex container
- **WHEN** user views complaint list
- **THEN** list container height is constrained by flex parent, not viewport
