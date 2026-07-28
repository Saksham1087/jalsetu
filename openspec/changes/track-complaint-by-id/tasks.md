## 1. Service Layer — Complaint Lookup

- [x] 1.1 Add `getComplaintById` to `firestore.js` — single document fetch by doc ID using `getDoc`
- [x] 1.2 Add `getById` to `complaintService.js` — search localStorage by `id` or `displayId`
- [x] 1.3 Add display ID generation utility — function `generateDisplayId()` that produces `CQ-{YEAR}-{RAND4}` format
- [x] 1.4 Wire display ID into complaint creation in both `firestore.js` and `complaintService.js`

## 2. UI — Track Page

- [x] 2.1 Create `TrackPage.jsx` — text input for complaint ID + "Track" button + result area
- [x] 2.2 Add `viewOnly` prop to `ComplaintDetail.jsx` — hides admin action buttons, keeps Close button
- [x] 2.3 Wire Track page to call lookup service on submit and render ComplaintDetail with `viewOnly`

## 3. Navigation & Routing

- [x] 3.1 Add `#/track` route to App.jsx hash router
- [x] 3.2 Add 4th "Track" tab to BottomNav.jsx with search icon

## 4. Post-Submission ID Display

- [x] 4.1 Show complaint `displayId` on the ComplaintForm success screen after submission
