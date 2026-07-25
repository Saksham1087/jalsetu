# Tasks: Admin Complaint Delete

## Data Layer

- [x] 1. Add `deleted`, `deletedAt`, `deletedBy` fields to Firestore `createComplaintData()` in `src/services/firestore.js`
- [x] 2. Add Firestore query filter `where('deleted', '==', false)` to `subscribeToAllComplaints()` in `src/services/firestore.js`
- [x] 3. Add Firestore query filter `where('deleted', '==', false)` to `getAllComplaints()` in `src/services/firestore.js`
- [x] 4. Add new exported function `softDeleteComplaint(complaintId, adminUid)` in `src/services/firestore.js`
- [x] 5. Add new exported function `restoreComplaint(complaintId)` in `src/services/firestore.js`
- [x] 6. Add new exported function `subscribeToDeletedComplaints(callback, errorCallback)` in `src/services/firestore.js`

## Demo/LocalStorage

- [x] 7. Filter out `c.deleted === true` in `complaintService.getComplaints()` in `src/services/complaintService.js`
- [x] 8. Add `deleted: false` to new complaints in `complaintService.create()` in `src/services/complaintService.js`
- [x] 9. Add `softDelete(id)` method to `complaintService` in `src/services/complaintService.js`
- [x] 10. Add `restore(id)` method to `complaintService` in `src/services/complaintService.js`

## Firestore Rules & Index

- [x] 11. Update Firestore security rules: add `deleted`, `deletedAt`, `deletedBy` to allowed update fields in `firestore.rules`
- [x] 12. Add composite index for `deleted ASC, createdAt DESC` in `firestore.indexes.json`

## Admin UI — Delete Action

- [x] 13. Add `handleComplaintDelete(complaintId)` callback to `App.jsx` that calls `softDeleteComplaint`
- [x] 14. Add "Delete Complaint" button with confirmation modal to `AdminComplaintDetail.jsx`
- [x] 15. Wire delete callback through `AdminLayout` to `AdminComplaintDetail`

## Admin UI — Trash View

- [x] 16. Create new `AdminTrash.jsx` component showing deleted complaints with Restore button
- [x] 17. Add "Deleted" nav item to sidebar in `AdminLayout.jsx`
- [x] 18. Add `handleComplaintRestore(complaintId)` callback to `App.jsx` that calls `restoreComplaint`
- [x] 19. Wire restore callback through `AdminLayout` to `AdminTrash`

## App Wiring

- [x] 20. Add `deletedComplaints` state and subscription in `App.jsx` for admin panel
- [x] 21. Pass `deletedComplaints` and `onRestoreComplaint` to `AdminLayout`
