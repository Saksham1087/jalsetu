# Spec: Complaint Soft Delete

## Requirement
Admins must be able to soft-delete complaints. Deleted complaints must be hidden from all citizen-facing views and admin dashboard stats, but remain recoverable via an admin-only trash view.

## Behavior

### Delete Action
- Admin opens complaint detail modal (AdminComplaintDetail)
- Clicks "Delete Complaint" button (red/destructive style)
- Confirmation modal appears: "Are you sure you want to delete this complaint? It can be restored from the Deleted section."
- On confirm: Firestore update sets `deleted: true`, `deletedAt: <serverTimestamp>`, `deletedBy: <admin uid>`
- Modal closes, complaint vanishes from all views

### Hidden From
- Public map (markers, popups, stats bar)
- Citizen complaint list
- Admin dashboard stats (total, pending, in progress, resolved counts)
- Admin complaint queue
- Admin complaint search
- Ward-wise stats

### Visible In
- Admin "Deleted Complaints" section (new nav item)
- Each deleted complaint shows: description, ward, status at time of deletion, who deleted, when deleted
- "Restore" button per item

### Restore Action
- Admin clicks "Restore" on deleted complaint
- Firestore update sets `deleted: false`, `deletedAt: null`, `deletedBy: null`
- Complaint reappears in all active views

## Constraints
- Only admins can delete (existing admin role check)
- Citizens cannot delete their own complaints
- No permanent delete in this version
- No bulk operations
- Firestore composite index required for `where('deleted','==',false)` + `orderBy('createdAt')`

## Edge Cases
- If admin deletes a complaint while another admin is viewing it → real-time subscription removes it from view
- If admin restores a complaint while another admin is viewing trash → real-time subscription removes it from trash
- Deleted complaint's status cannot be updated (hidden from all views)
