# Admin Complaint Delete Feature

## Problem
Admins cannot remove complaints from the system. Spam, duplicate, or invalid complaints clutter the dashboard and citizen-facing views, with no way to clean them up.

## Solution
Add a soft-delete system where admins can delete complaints. Deleted complaints are hidden from all citizen views (map, list, dashboard stats) but remain recoverable via a new "Deleted Complaints" section in the admin portal only.

## Scope
- Soft-delete via Firestore update (add `deleted`, `deletedAt`, `deletedBy` fields)
- Query-level filtering to exclude deleted complaints from all views
- New "Deleted" nav item in admin sidebar
- New AdminTrash component showing deleted complaints with Restore button
- Security rules update to allow admin delete fields

## Out of Scope
- Permanent/hard delete
- Citizen self-delete of complaints
- Bulk delete
- Deletion audit log (future enhancement)

## Success Criteria
- Admin can delete a complaint from AdminComplaintDetail modal
- Deleted complaints disappear from map, complaint list, and dashboard stats
- Deleted complaints appear in admin "Deleted Complaints" section only
- Admin can restore deleted complaints back to active state
- All existing functionality continues to work (no regressions)
