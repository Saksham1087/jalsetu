## Why

JalSetu has no personal landing for citizens. New users see a map of all complaints (overwhelming). Returning users have no way to see their own complaint history, track progress via ID, or receive status updates. Admins can update complaint status but have no way to notify affected citizens. This gap creates frustration: users submit complaints then have no feedback loop, no visibility, and no sense of progress.

## What Changes

- Add a **Dashboard** tab as the app's default landing page, showing personal complaint stats (total, resolved, resolution rate, recent activity)
- Add a **Track by ID** quick-action card on the Dashboard (replaces the standalone Track tab)
- Add a **Notifications** system: admin→user real-time messaging with 3 delivery tiers (individual per-complaint, ward broadcast, all-user broadcast)
- Add a **Notification bell** in the Header with unread badge, opening a bottom-sheet panel
- Add a **Profile page** accessed via avatar dropdown in the Header (replaces separate tab)
- Restructure bottom nav to 4 tabs: Dashboard (default) | Map | List | Report
- **BREAKING**: Remove standalone Track tab (functionality moves to Dashboard)
- **BREAKING**: Map is no longer the default landing tab

## Capabilities

### New Capabilities
- `citizen-dashboard`: Personal complaint dashboard with stats, recent complaints, quick actions, and first-time user empty state
- `notifications`: Real-time notification system with admin send panel, per-user Firestore delivery, unread badge, and bottom-sheet viewer
- `user-profile`: Simple profile page showing avatar, name, email, join date, complaint counts, and sign-out action

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **src/App.jsx**: Tab routing — Dashboard replaces Map as default, Track tab removed, 4-tab nav
- **src/components/Header.jsx**: Add notification bell with unread badge, make avatar clickable with dropdown menu
- **src/components/admin/AdminLayout.jsx**: Add "Send Notification" nav item
- **src/components/admin/AdminComplaintDetail.jsx**: Add "Notify User" toggle on status update
- **src/services/firestore.js**: New `notifications` collection CRUD, batch writes for broadcasts
- **src/hooks/**: New `useNotifications` hook (onSnapshot per userId)
- **New components**: Dashboard, NotificationPanel (bottom sheet), ProfilePage, AdminNotificationPanel
- **Firebase Security Rules**: Lock notifications reads to own userId, writes to admin role
- No new external dependencies
