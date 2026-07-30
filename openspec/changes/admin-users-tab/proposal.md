## Why

Admins have no way to see who's reporting complaints. They can search by userName in the complaints list but can't see aggregate per-user data, contact info, or quickly view all complaints from one person. This makes follow-up calls and pattern detection difficult.

## What Changes

- Add "Users" nav item to the admin sidebar between "Wards" and "Notify"
- Build `AdminUsers` component with two modes:
  - **User list**: aggregated from complaints, sorted by complaint count desc, shows name/phone/email/count/last date
  - **User complaints**: clicking a user shows only their complaints in a filtered list
- Search bar to filter users by name
- "← Back to Users" navigation from user complaints view
- Clicking a complaint opens existing `AdminComplaintDetail` modal

## Impact

- **src/components/admin/AdminLayout.jsx**: Add 'users' to navItems, render AdminUsers in main content
- **src/components/admin/AdminUsers.jsx**: New component
