## 1. Data Layer & Services

- [x] 1.1 Add notification CRUD to `src/services/firestore.js`: createNotification, batchCreateNotifications, subscribeToNotifications (onSnapshot per userId), markNotificationRead, markAllNotificationsRead
- [x] 1.2 Add notification functions to `src/services/complaintService.js` with localStorage fallback for demo mode
- [x] 1.3 Create `src/hooks/useNotifications.js` — subscribes to notifications on auth, unsubscribes on sign-out, exposes `notifications`, `unreadCount`, `markRead`, `markAllRead`
- [x] 1.4 Update Firestore security rules for `notifications` collection: read own, write admin only

## 2. Admin Notification Sending

- [x] 2.1 Add "Notify User" toggle + optional message field to `AdminComplaintDetail.jsx` — posts individual notification on status update
- [x] 2.2 Build `AdminSendNotification.jsx` — new admin page with ward dropdown, message textarea, "All Users" toggle, send button with confirmation
- [x] 2.3 Add "Send Notification" nav item to `AdminLayout.jsx` sidebar linking to AdminSendNotification
- [x] 2.4 Wire ward/global broadcast to Firestore batch writes (500/batch) with success/error toast feedback

## 3. Notification Bell & Bottom Sheet

- [x] 3.1 Add bell icon with unread count badge to `Header.jsx` — visible only for authenticated users, hidden in demo mode
- [x] 3.2 Build `NotificationPanel.jsx` — bottom-sheet component listing all notifications with type icons, title, message preview, relative time, unread styling (bold + colored left border)
- [x] 3.3 Implement tap handler: status_update notifications navigate to complaint detail; broadcast notifications mark read only
- [x] 3.4 Implement "Mark all as read" button at top of notification panel

## 4. Dashboard Component

- [x] 4.1 Build `Dashboard.jsx` — container orchestrating all dashboard sections, responsive layout (stats row → track ID card → notification section → recent complaints)
- [x] 4.2 Build stat cards: Total Complaints, Resolved, Resolution Rate (%), This Week — computed from current user's complaints
- [x] 4.3 Build Track by ID quick-action card (extracted from TrackPage) — text input + "Track" button + inline error for invalid ID
- [x] 4.4 Build recent complaints list — last 5 complaints with type icon, ward, relative time; tap navigates to detail
- [x] 4.5 Build unread notifications section — latest 3 unread notifications with "View all" link opening the bottom sheet
- [x] 4.6 Build empty state for first-time/no-complaint users — message + [Report Issue] + [Explore Map] CTAs
- [x] 4.7 Handle demo mode: stat cards from localStorage, notification section hidden, Track card searches localStorage

## 5. Profile Page

- [x] 5.1 Build `ProfilePage.jsx` — displays avatar, display name, email, member-since date, total/resolved complaint counts, sign-out button
- [x] 5.2 Make Header avatar clickable — dropdown menu with "Profile" and "Sign Out" options
- [x] 5.3 Handle demo mode: show "Demo User" placeholder, stats from localStorage, sign-out button becomes "Sign In"

## 6. Tab Restructure & Routing

- [x] 6.1 Update `App.jsx` — Dashboard becomes default landing tab; 4-tab bottom nav: Dashboard ★ | Map | List | Report
- [x] 6.2 Remove Track tab from bottom nav and hash routing (`#/track`)
- [x] 6.3 Add redirect: hash `#/track` → `#/dashboard` for backward compatibility
- [x] 6.4 Ensure Profile route works from avatar dropdown (render ProfilePage in app shell or as overlay)
- [x] 6.5 Clean up unused TrackPage import if no longer referenced elsewhere

## 7. Polish & Verification

- [x] 7.1 Ensure notification listener clean-up on component unmount and sign-out
- [x] 7.2 Verify all states: empty, populated, loading, error (Firestore unavailable), demo mode
- [x] 7.3 Run `npm run lint` and fix any issues
- [x] 7.4 Run `npm run build` and verify production build succeeds
