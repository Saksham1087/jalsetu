## ADDED Requirements

### Requirement: Notification data model
The system SHALL store notifications in a Firestore `notifications` collection with the following schema: `userId` (string, required), `type` (string: 'status_update' | 'ward_broadcast' | 'global_broadcast'), `title` (string, required), `message` (string, required), `complaintId` (string, optional), `read` (boolean, default false), `createdAt` (timestamp via serverTimestamp()). Every notification doc SHALL be indexed by userId and createdAt for efficient queries.

#### Scenario: Notification doc structure
- **WHEN** a notification is created
- **THEN** the Firestore doc SHALL contain userId, type, title, message, read: false, and createdAt server timestamp
- **THEN** complaintId SHALL be present only for status_update type

### Requirement: Admin sends individual notification on status update
When an admin updates a complaint's status from AdminComplaintDetail, a SHALL appear allowing the admin to notify the complainant. When enabled, the system SHALL create a notification doc with the complaint's userId, type 'status_update', complaintId, title "Status Updated", and message containing the new status.

#### Scenario: Admin updates complaint status with notification
- **WHEN** an admin changes a complaint's status and checks "Notify User"
- **THEN** a notification doc SHALL be created with userId matching the complaint's userId
- **THEN** the message SHALL include the complaint displayId, new status, and optional admin note

#### Scenario: Admin updates complaint status without notification
- **WHEN** an admin changes a complaint's status and does NOT check "Notify User"
- **THEN** no notification doc SHALL be created

### Requirement: Admin sends ward broadcast
The admin panel SHALL display a "Send Notification" page with a ward dropdown and message input. On submission, the system SHALL batch-create notification docs for all users who have complaints in the selected ward. Each notification SHALL have type 'ward_broadcast'.

#### Scenario: Admin sends ward broadcast
- **WHEN** an admin selects "Ward 4" and writes a message, then taps "Send"
- **THEN** the system SHALL query distinct userIds from complaints where ward === "Ward 4"
- **THEN** the system SHALL batch-write one notification doc per userId
- **THEN** the admin SHALL see a success toast: "Notification sent to Ward 4"

#### Scenario: Ward has no complainants
- **WHEN** an admin sends a broadcast to a ward with no complaints
- **THEN** the system SHALL show: "No users found for this ward"

### Requirement: Admin sends global broadcast
The admin "Send Notification" page SHALL include a "Send to All Users" option. On submission, the system SHALL batch-create notification docs for all distinct userIds in the complaints collection. Type SHALL be 'global_broadcast'.

#### Scenario: Admin sends global broadcast
- **WHEN** an admin selects "Send to All Users" and writes a message, then taps "Send"
- **THEN** the system SHALL query all distinct userIds from the complaints collection
- **THEN** the system SHALL batch-write one notification doc per userId (max 500 per batch)
- **THEN** the admin SHALL see a success toast: "Notification sent to all users"

### Requirement: User receives real-time notifications
The system SHALL subscribe to the authenticated user's notifications via Firestore onSnapshot, ordered by createdAt descending. The subscription SHALL only activate when a user is signed in.

#### Scenario: User signs in
- **WHEN** a user signs in
- **THEN** the system SHALL start an onSnapshot listener on notifications where userId === user.uid

#### Scenario: User signs out
- **WHEN** a user signs out
- **THEN** the system SHALL unsubscribe the notification listener

#### Scenario: New notification arrives
- **WHEN** a new notification doc is created for the current user
- **THEN** the notification listener SHALL fire with the updated list within 1 second

### Requirement: Notification bell shows unread count
The Header SHALL display a bell icon with a badge showing the count of unread notifications. The badge SHALL update in real-time as notifications are read or new ones arrive.

#### Scenario: Unread notifications exist
- **WHEN** the user has 3 unread notifications
- **THEN** the bell badge SHALL display "3"

#### Scenario: All notifications read
- **WHEN** the user has zero unread notifications
- **THEN** the bell badge SHALL NOT be displayed

### Requirement: Notification bottom sheet
Tapping the bell SHALL open a bottom-sheet panel listing all notifications ordered by time descending. Each item SHALL show: type icon (status_update: complaint icon, broadcast: megaphone icon), title, message, and relative time. Unread items SHALL be visually distinguished (bold title, colored left border). Tapping a notification SHALL mark it read. Tapping a status_update notification SHALL navigate to the complaint detail.

#### Scenario: Open notification panel
- **WHEN** a user taps the bell icon
- **THEN** a bottom sheet SHALL slide up from the bottom showing the full notification list

#### Scenario: Notification has complaint link
- **WHEN** a user taps a status_update notification with a complaintId
- **THEN** the notification SHALL be marked read
- **THEN** the app SHALL navigate to that complaint's detail view

#### Scenario: Notification is broadcast (no complaint)
- **WHEN** a user taps a ward_broadcast or global_broadcast notification
- **THEN** the notification SHALL be marked read only
- **THEN** the app SHALL NOT navigate

#### Scenario: Mark all read
- **WHEN** a user taps "Mark all as read" in the notification bottom sheet
- **THEN** all notifications for the current user SHALL have read set to true

### Requirement: Notifications require auth
Notifications SHALL only be delivered and displayed for authenticated users. Unauthenticated users SHALL NOT see the bell icon or any notification UI.

#### Scenario: Unauthenticated user
- **WHEN** a user is not signed in
- **THEN** the bell icon SHALL NOT render in the Header

#### Scenario: Demo mode
- **WHEN** isDemo is true
- **THEN** the bell icon SHALL NOT render in the Header
- **THEN** the admin notification panel SHALL NOT render

### Requirement: Firestore security rules
Firestore SHALL enforce that users can only read their own notifications (resource.data.userId == request.auth.uid). Writes to the notifications collection SHALL only be allowed for users with admin role.

#### Scenario: User reads own notifications
- **WHEN** a user queries notifications
- **THEN** the security rule SHALL only return docs where userId === request.auth.uid

#### Scenario: Non-admin tries to write
- **WHEN** a non-admin user attempts to create a notification
- **THEN** the write SHALL be denied by security rules
