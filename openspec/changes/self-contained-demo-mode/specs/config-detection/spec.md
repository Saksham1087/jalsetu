## ADDED Requirements

### Requirement: Centralized config module
The system SHALL provide a `src/lib/config.js` module that exports the availability of external services as booleans.

#### Scenario: Config reflects env vars
- **WHEN** `VITE_FIREBASE_API_KEY` is set
- **THEN** `appConfig.hasFirebase` SHALL be `true`
- **WHEN** `VITE_FIREBASE_API_KEY` is not set
- **THEN** `appConfig.hasFirebase` SHALL be `false`

#### Scenario: Config exposes isDemo flag
- **WHEN** no Firebase API key is configured
- **THEN** `isDemo` SHALL be `true`
- **WHEN** a Firebase API key is configured
- **THEN** `isDemo` SHALL be `false`

### Requirement: Components consume config, not env vars directly
All components SHALL import from `src/lib/config.js` instead of accessing `import.meta.env` directly for service availability checks.

#### Scenario: ComplaintForm checks config for validation
- **WHEN** `hasCloudinary` is `false`
- **THEN** the ComplaintForm SHALL NOT require a photo upload
- **WHEN** `hasFirebase` is `false`
- **THEN** the ComplaintForm SHALL NOT require authentication

#### Scenario: useComplaints checks config for backend selection
- **WHEN** `hasFirebase` is `false`
- **THEN** `useComplaints` SHALL use `complaintService` (localStorage) for all operations
- **WHEN** `hasFirebase` is `true`
- **THEN** `useComplaints` SHALL use Firestore for all operations
