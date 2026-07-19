## ADDED Requirements

### Requirement: App works zero-config without external services
The system SHALL function fully without Firebase, Cloudinary, or Gemini API keys configured. All three tabs (Map, List, Report) SHALL be usable with data stored in localStorage.

#### Scenario: App loads with no env vars
- **WHEN** the app starts with no VITE_FIREBASE_* or VITE_CLOUDINARY_* env vars
- **THEN** the Map tab SHALL display demo complaint markers
- **THEN** the List tab SHALL show 5 demo complaints
- **THEN** the Report tab SHALL be accessible and functional

### Requirement: Synthetic demo user
When Firebase is not configured, `useAuth` SHALL return a synthetic user object so all auth-gated features are accessible.

#### Scenario: Auth-gated features work in demo mode
- **WHEN** the app loads without Firebase
- **THEN** the Chat widget SHALL be visible
- **THEN** the Report tab SHALL NOT be disabled
- **THEN** the Header SHALL show a "Demo Mode" indicator

### Requirement: Complaints persist in localStorage
Complaints submitted in demo mode SHALL persist across page reloads.

#### Scenario: Submit and reload
- **WHEN** a complaint is submitted via the Report tab in demo mode
- **THEN** the complaint SHALL appear on the Map and List immediately
- **WHEN** the page is reloaded
- **THEN** the complaint SHALL still appear on the Map and List

#### Scenario: Demo data seeds on first load
- **WHEN** localStorage is empty and the app loads
- **THEN** 5 demo complaints SHALL be seeded into localStorage

### Requirement: Photo upload available in demo mode
When Cloudinary is not configured, the Report tab SHALL offer a local photo upload that resizes images client-side and stores them as base64 data URLs.

#### Scenario: Upload photo in demo mode
- **WHEN** the user picks a JPEG/PNG/WebP image under 5MB
- **THEN** the image SHALL be resized to max 1200px on the longest side
- **THEN** the image SHALL be stored as a base64 data URL in the complaint's `images` array

#### Scenario: Reject oversized file
- **WHEN** the user picks a file larger than 5MB
- **THEN** the form SHALL show an error message

### Requirement: Chat widget works with local AI
The Chat widget SHALL respond to user messages using the pure-JS `chatLogic.js` module when no Gemini API key is configured.

#### Scenario: Chat responds to water issue keywords
- **WHEN** the user types "leak" in the chat input
- **THEN** the assistant SHALL respond with leak-specific guidance

#### Scenario: Chat shows help menu for unknown input
- **WHEN** the user types an unrecognized message
- **THEN** the assistant SHALL display the available water issue categories
