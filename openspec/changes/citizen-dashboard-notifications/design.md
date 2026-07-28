## Context

JalSetu currently has 5 tabs: Map (default), List, Report, Track, and Admin (for admins). The app has no personal landing for signed-in users. The Header shows logo, theme toggle, and sign-in button. Complaints are stored in Firestore, and real-time updates use onSnapshot. Auth uses Firebase Google sign-in. The app has a demo mode (isDemo) for environments without Firebase.

This change adds three connected features: a Dashboard landing page, a real-time notification system, and a user profile page. The Track tab is folded into Dashboard.

## Goals / Non-Goals

**Goals:**
- Replace Map as default tab with Dashboard for signed-in users and first-time visitors
- Move Track by ID functionality into Dashboard as a quick-action card
- Deliver real-time admin→user notifications at 3 tiers: individual, ward broadcast, global broadcast
- Provide user profile accessible from header avatar dropdown
- Reduce bottom nav to 4 tabs: Dashboard, Map, List, Report
- All features degrade gracefully in demo mode (localStorage fallback)

**Non-Goals:**
- Multi-language notification content (English only for now)
- Notification push to device (Firebase Cloud Messaging) — in-app only
- Custom notification preferences (opt-in/opt-out per type)
- Gamification or reputation system
- Complaint drafting via ChatWidget
- Multi-category complaints (water only)

## Decisions

### Dashboard as default tab
**Chosen**: Dashboard replaces Map as the default app landing.
**Rationale**: Returning users need personal context first — their stats, recent complaints, and notifications. The map is still one tap away. This matches mobile app conventions (home feed > explore).
**Alternatives considered**: Keep Map as default, add Dashboard as 5th tab. Rejected because it buries the most useful feature and adds nav clutter.

### 4-tab bottom navigation
**Chosen**: Dashboard | Map | List | Report (Track removed as standalone tab).
**Rationale**: 4 tabs is the mobile sweet spot. Track by ID is a quick action, not a destination — it fits naturally in Dashboard.
**Alternatives considered**: 5 tabs including Track. Rejected per decision above.

### Notifications: N docs per user (Firestore)
**Chosen**: Write one notification doc per targeted user. Broadcasts write N docs via batch writes (500/batch).
**Rationale**: Simple, standard Firestore pattern. Each user reads only their own docs. Security rules are straightforward. Firestore batch writes handle scale for Mira Bhayander's user base.
**Alternatives considered**: Write 1 doc with targetType='all' and filter client-side. Rejected because it complicates read logic, security rules, and per-user read status.

### Notification delivery: onSnapshot (not push)
**Chosen**: Real-time in-app via Firestore onSnapshot. No FCM.
**Rationale**: App is already set up for onSnapshot subscriptions. FCM requires service worker, additional config, and is overkill for a PWA where users stay on the page.
**Risk**: If user is on another tab or closes the browser, they won't see notifications until they return. Accepted for MVP.

### Admin notification panel: New page, not inline
**Chosen**: A dedicated "Send Notification" page in the admin layout, separate from the complaint detail.
**Rationale**: Ward and global broadcasts need their own UI (ward selector, message input, confirmation). Inline in AdminComplaintDetail would mix concerns.
**Exception**: The "Notify on status update" toggle lives in AdminComplaintDetail since it's context-specific.

### Profile: Avatar dropdown, not a tab
**Chosen**: Clickable avatar in Header opens dropdown to "Profile" and "Sign Out".
**Rationale**: Profile is visited rarely (2-3 times per user lifetime). It doesn't deserve a bottom-nav slot. Avatar dropdown is the universal mobile pattern.
**Alternatives considered**: Profile as 5th tab. Rejected. Gear icon in header. Rejected — less discoverable than avatar.

### Notification bottom sheet, not full page
**Chosen**: Bell tap opens a bottom-sheet panel.
**Rationale**: Notifications are transient — users glance at them and dismiss. A bottom sheet is less disruptive than a full page transition and keeps context.
**Alternatives considered**: Full notification page. Rejected — overkill for a list of messages.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users expect Map as default, confused by change | Show subtle "Tap Map to explore" hint on first Dashboard visit; onboarding banner for returning users |
| Batch writes for broadcasts hit Firestore limits | Use batched writes (500 ops/batch); loop for larger user sets; add rate limiting in admin UI |
| onSnapshot listener stays active after user leaves page | Clean up listener in useEffect return; unsubscribe on sign-out |
| Notification bottom sheet conflicts with existing bottom nav | Bottom sheet overlays content, not nav — nav remains visible underneath |
| Dashboard empty state feels useless for first-timers | Empty state has clear CTA buttons — "Report Issue" and "Explore Map" — directing action |
| Auth user with zero complaints sees all-zero stats | Zero state is acceptable; stats cards show 0s; recent complaints list is empty with "No complaints yet" text |
