## ADDED Requirements

### Requirement: User roles
The system SHALL support three user roles: "citizen" (default), "admin", and "worker".

#### Scenario: New user gets citizen role
- **WHEN** a new user registers via Google sign-in or email/password
- **THEN** their Firestore user document has `role: "citizen"`

### Requirement: Admin email/password login
The system SHALL allow admin users to log in using email and password via Firebase Auth.

#### Scenario: Admin logs in with email/password
- **WHEN** admin enters valid email and password on login page
- **THEN** Firebase Auth authenticates the user and app checks Firestore for admin role

#### Scenario: Invalid admin credentials
- **WHEN** user enters wrong email or password
- **THEN** system shows "Invalid email or password" error

#### Scenario: Non-admin tries admin login
- **WHEN** user with "citizen" role logs in via admin login
- **THEN** system shows "Access denied" error (not "invalid credentials")

### Requirement: Role stored in Firestore
The system SHALL store user roles in the Firestore `users` collection, keyed by Firebase Auth UID.

#### Scenario: Role document created on registration
- **WHEN** user registers for the first time
- **THEN** a document is created in `users` collection with `{ uid, email, name, role: "citizen", createdAt }`

#### Scenario: Role checked on admin route
- **WHEN** user navigates to `/admin`
- **THEN** system reads user's role from Firestore and grants/denies access

### Requirement: Admin login page
The system SHALL provide a dedicated login page for admin access (separate from citizen auth modal).

#### Scenario: Admin login page accessible
- **WHEN** user navigates to `/login` or `/admin/login`
- **THEN** admin login form with email and password fields is displayed

#### Scenario: Admin login redirects to dashboard
- **WHEN** admin successfully authenticates
- **THEN** system redirects to `/admin` dashboard

### Requirement: Auth state persistence
The system SHALL persist admin auth state across page reloads using Firebase Auth persistence.

#### Scenario: Admin reloads page
- **WHEN** admin is logged in and reloads the page
- **THEN** admin remains logged in and dashboard loads without re-authentication
