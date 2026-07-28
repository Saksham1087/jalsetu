## 1. Create date helper

- [x] 1.1 Create `src/utils/date.js` with `toDate()` helper function

## 2. Fix formatters

- [x] 2.1 Update `formatRelativeTime` to use `toDate()`, return '' on invalid
- [x] 2.2 Update `formatDate` to use `toDate()`, return '' on invalid

## 3. Fix admin component inline dates

- [x] 3.1 Fix `AdminComplaints.jsx` — replace `new Date(complaint.createdAt)` with `toDate()`
- [x] 3.2 Fix `AdminTrash.jsx` — replace `new Date(complaint.deletedAt)` with `toDate()`
- [x] 3.3 Fix `AdminComplaintDetail.jsx` — replace `new Date(entry.timestamp)` with `toDate()`
- [x] 3.4 Fix `AdminDashboard.jsx` — replace `new Date(complaint.createdAt)` with `toDate()`

## 4. Fix ComplaintList sort dates

- [x] 4.1 Replace `new Date()` with `toDate()` in sort-by-date comparisons

## 5. Fix PublicMap popup date

- [x] 5.1 Simplify popup date creation using `toDate()` instead of manual `.toDate()` check

## 6. Normalize timeline in useComplaints

- [x] 6.1 Add `timeline[].timestamp` and `deletedAt` normalization to `normalizeData`

## 7. Verification

- [x] 7.1 Build passes
- [x] 7.2 Lint passes
