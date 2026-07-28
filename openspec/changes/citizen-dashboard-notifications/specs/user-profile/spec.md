## ADDED Requirements

### Requirement: Profile accessible from header avatar
The app SHALL display the user's profile photo (or initial-letter fallback if no photo) in the Header. Tapping the avatar SHALL open a dropdown menu with "Profile" and "Sign Out" options. The dropdown SHALL only appear for authenticated users.

#### Scenario: Authenticated user sees avatar
- **WHEN** a user is signed in with Google
- **THEN** their Google profile photo SHALL display in the Header as a small circular avatar
- **WHEN** the user taps the avatar
- **THEN** a dropdown SHALL appear with "Profile" and "Sign Out"

#### Scenario: No profile photo
- **WHEN** a user is signed in but has no profile photo
- **THEN** the first letter of their display name SHALL display as a circular avatar

#### Scenario: Unauthenticated user
- **WHEN** a user is not signed in
- **THEN** the avatar dropdown SHALL NOT render (sign-in button displays instead)

### Requirement: Profile page content
The Profile page SHALL display: user's profile photo (large), display name, email address, "Member since" date (derived from auth metadata), total complaints count, resolved complaints count, and a "Sign Out" button.

#### Scenario: Profile page loads
- **WHEN** a user navigates to Profile from the avatar dropdown
- **THEN** the page SHALL display the user's photo, name, email, member-since date, complaint stats, and a Sign Out button

#### Scenario: Sign Out
- **WHEN** a user taps the Sign Out button on the Profile page
- **THEN** the auth sign-out flow SHALL execute
- **THEN** the user SHALL be redirected to the Dashboard

### Requirement: Profile works with demo data
When Firebase is unavailable, the Profile page SHALL derive user info from localStorage or show fallback content. Complaint stats SHALL be computed from localStorage.

#### Scenario: Profile in demo mode
- **WHEN** isDemo is true
- **THEN** the Profile page SHALL show "Demo User" as name and placeholder avatar
- **THEN** complaint stats SHALL be computed from localStorage
