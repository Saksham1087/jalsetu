## ADDED Requirements

### Requirement: Map centered on Mira Bhayander
The system SHALL default the Leaflet map center to Mira Bhayander coordinates (approximately 19.2813°N, 72.8568°E) instead of Delhi.

#### Scenario: Map loads at Mira Bhayander
- **WHEN** user opens the Map tab
- **THEN** map center is Mira Bhayander (19.2813, 72.8568) at zoom level 12

### Requirement: Map bounds restricted to Mira Bhayander
The system SHALL restrict panning to Mira Bhayander municipal bounds (19.25–19.32°N, 72.83–72.90°E).

#### Scenario: User cannot pan outside MBMC area
- **WHEN** user attempts to drag map beyond Mira Bhayander bounds
- **THEN** map stops panning at the boundary edge

#### Scenario: User location outside bounds
- **WHEN** user's GPS location is outside Mira Bhayander bounds
- **THEN** map still loads centered on Mira Bhayander (not user location)

### Requirement: Ward dropdown in complaint form
The system SHALL provide a dropdown listing 24 MBMC electoral wards (Ward 1 through Ward 24) in the complaint submission form.

#### Scenario: User selects ward
- **WHEN** user opens the complaint form
- **THEN** a "Ward / Area" dropdown shows Ward 1 through Ward 24

#### Scenario: Ward auto-detected from coordinates
- **WHEN** user picks a location on the map
- **THEN** system attempts to auto-fill the ward field based on reverse geocode

### Requirement: Ward filter in complaint list
The system SHALL allow filtering the complaint list by ward number.

#### Scenario: Filter by ward
- **WHEN** user selects a specific ward from the filter bar
- **THEN** only complaints from that ward are displayed

### Requirement: Default water supply schedule
The system SHALL define a default water supply schedule of 7:00–9:00 AM and 7:00–9:00 PM for all wards.

#### Scenario: Schedule displayed in chatbot
- **WHEN** user asks about water supply timing
- **THEN** chatbot responds with "Water supply in Mira Bhayander: 7–9 AM and 7–9 PM daily"

### Requirement: Localized chatbot knowledge
The system SHALL provide the chatbot with Mira Bhayander-specific knowledge including supply schedule, MBMC contacts, and known issue areas.

#### Scenario: User asks about MBMC contact
- **WHEN** user asks "how do I contact MBMC about water?"
- **THEN** chatbot responds with MBMC water complaint number (022-28140002)

#### Scenario: User reports issue in known area
- **WHEN** user mentions an area with known issues (e.g., "Ghodbunder low pressure")
- **THEN** chatbot provides area-specific guidance

### Requirement: Demo data localized to Mira Bhayander
The system SHALL use Mira Bhayander coordinates in demo complaint data instead of Delhi coordinates.

#### Scenario: Demo mode shows local complaints
- **WHEN** app runs in demo mode (no Firebase config)
- **THEN** demo complaints are located within Mira Bhayander bounds with MBMC ward references
