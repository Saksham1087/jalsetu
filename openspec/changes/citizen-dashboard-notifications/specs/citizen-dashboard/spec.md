## ADDED Requirements

### Requirement: Dashboard is default landing tab
The app SHALL display the Dashboard as the default tab when a user opens the app. First-time visitors (no complaints, no auth) SHALL see an empty state with a prompt to report an issue or explore the map.

#### Scenario: Authenticated user opens app
- **WHEN** a signed-in user opens JalSetu
- **THEN** the Dashboard tab SHALL be selected by default

#### Scenario: First-time visitor opens app
- **WHEN** an unsigned-in user with no localStorage history opens JalSetu
- **THEN** the Dashboard SHALL show an empty state with the message "You haven't reported any issues yet" and buttons to [Report Issue] and [Explore Map]

### Requirement: Dashboard shows personal complaint stats
The system SHALL display four stat cards on the Dashboard: Total Complaints, Resolved Complaints, Resolution Rate (percentage), and Complaints This Week. Stats SHALL be computed from the current user's complaints data in Firestore.

#### Scenario: User has complaints
- **WHEN** the Dashboard loads for a signed-in user with complaints
- **THEN** stat cards SHALL show: total count, resolved count (status === 'resolved' or 'closed'), resolution rate rounded to integer percentage, and count of complaints created in the last 7 days

#### Scenario: User has no complaints
- **WHEN** the Dashboard loads for a user with zero complaints
- **THEN** stat cards SHALL show 0 for all values

### Requirement: Dashboard shows recent complaints list
The Dashboard SHALL display a list of the user's 5 most recent complaints, ordered by createdAt descending. Each item SHALL show type icon, complaint title, ward, and relative time (e.g., "2d ago").

#### Scenario: Recent complaints display
- **WHEN** the Dashboard loads
- **THEN** the system SHALL query the complaints collection filtered by userId, ordered by createdAt desc, limited to 5
- **THEN** each item SHALL display the complaint type, ward, and relative time since creation

#### Scenario: Tap recent complaint
- **WHEN** a user taps a recent complaint item on the Dashboard
- **THEN** the app SHALL navigate to the complaint detail view

### Requirement: Dashboard has Track by ID card
The Dashboard SHALL include a Track by ID quick-action card positioned below the stats cards. The card SHALL contain a text input for a complaint ID (displayId or short code) and a "Track" button. On submission, it SHALL navigate to the complaint detail view.

#### Scenario: Track by ID on Dashboard
- **WHEN** a user enters a valid complaint ID in the Track input and taps "Track"
- **THEN** the app SHALL navigate to the complaint detail view showing that complaint

#### Scenario: Track with invalid ID
- **WHEN** a user enters an ID that does not match any complaint
- **THEN** the card SHALL show an inline error message: "Complaint not found. Please check the ID."

### Requirement: Dashboard shows unread notifications section
The Dashboard SHALL display the 3 most recent unread notifications below the Track ID card. Each notification SHALL show the title, message preview, and relative time. A "View all" link SHALL open the notification bottom sheet.

#### Scenario: User has unread notifications
- **WHEN** the Dashboard loads for a user with unread notifications
- **THEN** the latest 3 unread notifications SHALL be displayed with title, message preview (first 80 chars), and relative time

#### Scenario: User taps "View all"
- **WHEN** a user taps "View all" on the notification section
- **THEN** the notification bottom sheet SHALL open

### Requirement: Dashboard works in demo mode
When Firebase is unavailable, the Dashboard SHALL gracefully degrade using localStorage data. Stats SHALL be computed from locally stored complaints. The notifications section SHALL be hidden.

#### Scenario: Dashboard in demo mode
- **WHEN** isDemo is true (Firebase unavailable)
- **THEN** stat cards SHALL compute from localStorage complaints
- **THEN** the notification section SHALL NOT render
- **THEN** the Track by ID card SHALL search localStorage
