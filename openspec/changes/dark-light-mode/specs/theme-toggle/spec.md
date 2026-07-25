## ADDED Requirements

### Requirement: User can toggle theme
The system SHALL provide a toggle in the header that switches between light and dark modes. The toggle SHALL use sun/moon SVG icons. The system SHALL persist the user's theme preference across sessions using localStorage under the key `jalsetu-theme`.

#### Scenario: Toggle from light to dark
- **WHEN** user is in light mode and clicks the moon icon in the header
- **THEN** the page switches to dark mode, the icon changes to a sun, and the preference is saved to localStorage

#### Scenario: Toggle from dark to light
- **WHEN** user is in dark mode and clicks the sun icon in the header
- **THEN** the page switches to light mode, the icon changes to a moon, and the preference is saved to localStorage

### Requirement: Theme persists on page reload
The system SHALL read the theme preference from localStorage on initial load and apply it before the first paint to avoid a flash of un-themed content.

#### Scenario: Reload preserves theme
- **WHEN** user selects dark mode and reloads the page
- **THEN** the page renders in dark mode without visual flash

#### Scenario: No stored preference falls back to system
- **WHEN** user visits for the first time with no localStorage entry and their OS uses light mode
- **THEN** the page renders in light mode

#### Scenario: First visit with dark OS preference
- **WHEN** user visits for the first time with no localStorage entry and their OS uses dark mode
- **THEN** the page renders in dark mode

### Requirement: Dark mode uses ocean-derived palette
The dark mode color palette SHALL be derived from the existing water/ocean identity, not generic gray tones. Page background SHALL be `#0B171A` (deep ocean), card surfaces SHALL be `#152426` (dark teal), and text SHALL be `#E8EDF0`/`#C8D3D8` (ice-blue).

#### Scenario: Card renders with dark surface
- **WHEN** a complaint card is displayed in dark mode
- **THEN** the card background SHALL be the dark teal surface color and text SHALL have sufficient contrast

### Requirement: Admin panel respects theme
The admin layout, dashboard, complaints list, and wards views SHALL switch between light and dark mode consistently with the citizen-facing components.

#### Scenario: Admin in dark mode
- **WHEN** an admin user navigates to the admin panel while dark mode is active
- **THEN** all admin components use dark mode colors

### Requirement: Theme switch has smooth transition
The system SHALL apply a CSS transition on `background-color`, `color`, and `border-color` properties when switching themes. The transition SHALL be disabled when `prefers-reduced-motion` is active.

#### Scenario: Smooth theme transition
- **WHEN** user toggles themes
- **THEN** colors crossfade smoothly over 300ms

#### Scenario: Reduced motion respected
- **WHEN** user has `prefers-reduced-motion: reduce` set and toggles themes
- **THEN** the theme switches instantaneously without animation
