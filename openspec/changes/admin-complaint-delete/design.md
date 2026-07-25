# Design: Admin Complaint Delete

## Data Model

### New Fields on Complaint Document

```javascript
{
  // existing fields...
  deleted: false,        // boolean flag
  deletedAt: null,       // Firestore Timestamp (null when not deleted)
  deletedBy: null,       // uid of admin who deleted (null when not deleted)
}
```

**Approach**: Flag-based soft delete (not subcollection move). Reasons:
- No data migration needed
- Firestore `where('deleted', '==', false)` filters at query level
- Recovery is trivial (flip boolean)
- Composite index works cleanly

### Query Architecture

```
Active complaints (all citizen views + admin dashboard):
  collection('complaints')
  .where('deleted', '==', false)
  .orderBy('createdAt', 'desc')

Deleted complaints (admin trash view only):
  collection('complaints')
  .where('deleted', '==', true)
  .orderBy('deletedAt', 'desc')
```

**Firestore Composite Index Required**: `deleted ASC, createdAt DESC` for active query.

### Subscription Points

All three existing subscriptions automatically benefit from the Firestore-level filter:

1. `useComplaints.js` → citizen app (map, list, report)
2. `PublicMap.jsx` → map view (independent subscription)
3. `App.jsx` → admin panel subscription

No component-level filtering needed — Firestore handles it.

## Security Rules

Current allowed update fields: `['status', 'updatedAt', 'timeline']`

Updated to: `['status', 'updatedAt', 'timeline', 'deleted', 'deletedAt', 'deletedBy']`

Only admins can set/delete fields (existing admin check applies).

## UI Components

### AdminComplaintDetail (modified)
- Add red "Delete Complaint" button in action area
- Confirmation modal before delete
- On confirm: `updateDoc(ref, { deleted: true, deletedAt: now, deletedBy: uid })`

### AdminTrash (new component)
- Lists only soft-deleted complaints
- Each row shows: complaint description, ward, who deleted, when
- "Restore" button per item
- On restore: `updateDoc(ref, { deleted: false, deletedAt: null, deletedBy: null })`

### AdminLayout (modified)
- Add "Deleted" nav item with trash icon
- Route to AdminTrash when activeNav === 'trash'

## Data Flow

```
Delete:
  Admin → Click "Delete" → Confirm → Firestore update({deleted: true})
    → Real-time subscription auto-fires
    → Complaint vanishes from all active views
    → Stats recalculate automatically
    → Complaint appears in trash view

Restore:
  Admin → View Deleted → Click "Restore" → Firestore update({deleted: false})
    → Real-time subscription auto-fires
    → Complaint reappears in all active views
    → Stats recalculate automatically
    → Complaint vanishes from trash view
```

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Firestore index missing | Pre-create in firestore.indexes.json |
| PublicMap bypasses filter | Firestore-level filter covers it |
| localStorage leak | Filter in complaintService.getComplaints() |
| Stats miscount | Filter at query level (automatic) |
