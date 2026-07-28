## ADDED Requirements

### Requirement: Complaint lookup by ID
The system SHALL allow anyone to look up a complaint by entering its display ID or internal ID in a public Track page, without requiring authentication.

#### Scenario: Successful lookup by display ID
- **WHEN** the user enters a valid complaint display ID (e.g., `CQ-2026-A1B2`) on the Track page and clicks "Track"
- **THEN** the system displays the full complaint details including status, description, timeline, photos, and metadata in read-only mode

#### Scenario: Successful lookup by internal ID
- **WHEN** the user enters a complaint's internal Firebase document ID
- **THEN** the system displays the same detail view as a display ID lookup

#### Scenario: Complaint not found
- **WHEN** the user enters an ID that does not match any complaint
- **THEN** the system shows a clear "Complaint not found" message with the search input still available for retry

#### Scenario: Unauthenticated user sees read-only view
- **WHEN** an unauthenticated user views a complaint via the Track page
- **THEN** the system hides all admin action buttons (Acknowledge, Start Work, Mark Resolved) and only shows complaint details + a Close button

### Requirement: Human-readable display ID generation
The system SHALL generate a human-readable display ID for each new complaint at creation time, using the format `CQ-{YEAR}-{CODE}` where CODE is a 4-character alphanumeric string.

#### Scenario: New complaint gets display ID
- **WHEN** a complaint is submitted
- **THEN** the system generates a `displayId` field with format `CQ-{currentYear}-{random4Chars}` and stores it alongside the complaint data

### Requirement: Display ID shown after submission
The system SHALL show the complaint's display ID prominently on the submission success screen so the user can note it for future reference.

#### Scenario: Post-submission display
- **WHEN** a complaint is successfully submitted
- **THEN** the success screen shows the display ID in a large, copyable format with a note like "Save this ID to track your complaint"

### Requirement: Client-side lookup in demo mode
The system SHALL support complaint lookup by both display ID and internal ID when running in demo mode (localStorage).

#### Scenario: Demo mode lookup
- **WHEN** the app is in demo mode and the user enters a complaint ID on the Track page
- **THEN** the system searches localStorage for a matching complaint by `displayId` or `id` and returns the result
