## Why

Citizens currently have no way to check their complaint status without logging in and browsing the full list or map. There's no shareable reference they can take away after filing. This makes the app feel like a black box — you submit and hope for the best. A simple complaint ID lookup gives every complainant a direct window into their resolution progress.

## What Changes

- New public Track page with a text input for complaint ID lookup
- No authentication required — anyone with a complaint ID can check status
- Shows full complaint detail (status, timeline, photos, description) in read-only mode
- Human-readable complaint ID format (e.g., `CQ-2026-A1B2`) generated at submission time
- New `getComplaintById` function in both Firestore and demo (localStorage) services
- New hash route `#/track` and 4th bottom-nav tab
- ComplaintDetail component gets a `viewOnly` prop to hide admin action buttons
- After form submission, shows the complaint ID prominently so the user can note it

## Capabilities

### New Capabilities
- `complaint-id-lookup`: Lookup complaint by its ID, public page with no auth gate

### Modified Capabilities
- (none)

## Impact

- `src/services/firestore.js`: New `getComplaintById()` using `getDoc`
- `src/services/complaintService.js`: New `getById()` method for demo mode
- `src/components/ComplaintDetail.jsx`: Support `viewOnly` prop to conditionally hide action buttons
- `src/components/BottomNav.jsx`: Add 4th tab "Track"
- `src/App.jsx`: New `#/track` route, imports TrackPage
- `src/hooks/useComplaints.js`: Expose complaint ID after submission
- `src/lib/config.js`: Potentially expose human-readable ID generation utility
- New file `src/components/TrackPage.jsx`
