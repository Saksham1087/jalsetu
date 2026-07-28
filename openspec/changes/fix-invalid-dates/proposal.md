## Why

Dates show "Invalid" across the app because:
- Firestore Timestamp objects get passed directly to `new Date()` which can't parse them
- Admin data path has no date normalization
- `timeline[].timestamp` values aren't normalized in `useComplaints`
- Many components use raw `new Date()` without null/firestore checks

## What Changes

- Create a safe `toDate()` helper that handles Firestore Timestamps, Date objects, ISO strings, and null
- Update `formatRelativeTime` and `formatDate` in formatters to use it
- Fix all inline `new Date()` calls in admin components, ComplaintList, PublicMap

## Capabilities

### New Capabilities
- `date-utils`: Shared `toDate()` helper for safely converting any date format

### Modified Capabilities
- `formatters`: Use `toDate()` in `formatRelativeTime` and `formatDate` for robustness
- `admin-complaint-list`: Fix inline date formatting
- `admin-trash`: Fix inline date formatting
- `admin-complaint-detail`: Fix inline date formatting
- `admin-dashboard`: Fix inline date formatting
- `complaint-list`: Fix sort-by-date logic

## Impact

- `src/utils/date.js` — new file with `toDate()` helper
- `src/utils/formatters.js` — use `toDate()` instead of raw `new Date()`
- `src/components/admin/AdminComplaints.jsx` — fix date display
- `src/components/admin/AdminTrash.jsx` — fix date display
- `src/components/admin/AdminComplaintDetail.jsx` — fix date display
- `src/components/admin/AdminDashboard.jsx` — fix date display
- `src/components/ComplaintList.jsx` — fix sort by date
- `src/components/PublicMap.jsx` — fix popup date (already has workaround, simplify)
