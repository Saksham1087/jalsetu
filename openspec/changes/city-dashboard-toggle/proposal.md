## Why

Dashboard currently shows personal stats only. Citizens have no way to see city-wide complaint volume, resolution trends, or how active reporting is across Mira Bhayander. Adding a toggle lets users switch between their personal view and a city overview without leaving the dashboard.

## What Changes

- Add a two-tab pill toggle below the welcome message: "My View" | "JalSetu Overview"
- In "JalSetu Overview" mode, stat cards show city-wide data (all complaints) instead of personal
- Recent Complaints list shows top 5 most recent city-wide
- Track by ID, Emergency Call, and Notifications sections remain unchanged
- No persistence — always start on "My View"
- Header text changes from "Welcome, {name}" to "JalSetu Overview" in city mode

## Capabilities

### New Capabilities
- `dashboard-toggle`: Two-mode dashboard with personal/city-wide views via segmented pill control

## Impact

- **src/components/Dashboard.jsx**: Add viewMode state, segmented toggle UI, conditional filtering for stats + recent complaints
