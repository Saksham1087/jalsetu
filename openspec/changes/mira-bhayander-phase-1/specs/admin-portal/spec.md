## ADDED Requirements

### Requirement: Admin dashboard route
The system SHALL provide an `/admin` route accessible only to users with the "admin" role.

#### Scenario: Admin accesses dashboard
- **WHEN** user with role "admin" navigates to `/admin`
- **THEN** admin dashboard is displayed

#### Scenario: Citizen blocked from admin
- **WHEN** user with role "citizen" (or no role) navigates to `/admin`
- **THEN** system redirects to home page

#### Scenario: Unauthenticated user blocked from admin
- **WHEN** unauthenticated user navigates to `/admin`
- **THEN** system redirects to login page

### Requirement: Admin dashboard overview stats
The system SHALL display summary statistics on the admin dashboard including total complaints, pending, acknowledged, in-progress, and resolved counts.

#### Scenario: Stats displayed
- **WHEN** admin opens dashboard
- **THEN** stats cards show: Total, Pending, Acknowledged, In Progress, Resolved complaint counts

#### Scenario: Stats update in real-time
- **WHEN** a new complaint is submitted by a citizen
- **THEN** admin dashboard stats update without page refresh

### Requirement: Admin complaint queue
The system SHALL display a filterable, sortable list of all complaints in the admin dashboard.

#### Scenario: View all complaints
- **WHEN** admin opens complaint queue
- **THEN** all complaints are listed with ID, type, ward, status, and timestamp

#### Scenario: Filter by status
- **WHEN** admin selects a status filter (e.g., "pending")
- **THEN** only complaints with that status are shown

#### Scenario: Filter by ward
- **WHEN** admin selects a ward filter
- **THEN** only complaints from that ward are shown

#### Scenario: Filter by type
- **WHEN** admin selects a complaint type filter
- **THEN** only complaints of that type are shown

### Requirement: Admin complaint detail view
The system SHALL allow admin to view full complaint details including description, photos, location, timeline, and ward.

#### Scenario: View complaint detail
- **WHEN** admin clicks "View" on a complaint in the queue
- **THEN** full complaint detail modal opens with all fields

### Requirement: Admin status update
The system SHALL allow admin to update complaint status (acknowledged, in_progress, resolved, rejected) with an optional note.

#### Scenario: Acknowledge complaint
- **WHEN** admin changes status to "acknowledged" and clicks save
- **THEN** complaint status updates and timeline entry is added

#### Scenario: Resolve complaint
- **WHEN** admin changes status to "resolved" with note "Pipe repaired"
- **THEN** complaint status updates, timeline shows the note, and citizen can see update

### Requirement: Admin layout with navigation
The system SHALL provide an admin-specific layout with sidebar navigation and header showing admin info.

#### Scenario: Admin layout renders
- **WHEN** admin is logged in and on any `/admin/*` route
- **THEN** sidebar shows Dashboard, Complaints, Workers (placeholder), Wards (placeholder), Settings (placeholder) links
