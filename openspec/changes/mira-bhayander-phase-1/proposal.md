## Why

Mira Road and Bhayander (Mira Bhayander Municipal Corporation — MBMC) face growing water supply challenges: irregular distribution, aging pipelines causing leaks, and supply inconsistencies across neighborhoods. The current JalSetu app is a generic complaint system with no localization, no admin workflow, and no area-specific knowledge. Phase 1 transforms it into a purpose-built platform for MBMC's water supply management.

## What Changes

- **Map localization**: Lock Leaflet map to Mira Bhayander bounds (19.25–19.32°N, 72.83–72.90°E), default center on MBMC territory
- **Ward system**: Add 24 MBMC electoral wards to complaint form dropdown and list filters
- **Admin dashboard**: New admin portal with complaint queue, stats overview, status management, and worker assignment
- **Role-based auth**: Separate admin login (email/password) with role checks on Firestore `users` collection
- **Chatbot localization**: Enhance chatbot with Mira Bhayander supply schedule (7–9 AM/PM default), known issue areas, MBMC contacts
- **Demo data**: Replace Delhi-centered demo data with Mira Bhayander coordinates and ward references

## Capabilities

### New Capabilities
- `mira-bhayander-localization`: Map bounds, ward data, default supply schedule, and area-specific constants
- `admin-portal`: Admin dashboard with complaint queue, stats, status management, and route protection
- `role-based-auth`: User roles (citizen/admin), separate admin login, Firestore role storage

### Modified Capabilities

(none — no existing specs)

## Impact

**Files to create:**
- `src/lib/miraBhayander.js` — ward data, bounds, schedule
- `src/components/admin/AdminLayout.jsx` — admin sidebar + header
- `src/components/admin/AdminDashboard.jsx` — stats + complaint queue
- `src/components/admin/AdminComplaintDetail.jsx` — single complaint view

**Files to modify:**
- `src/App.jsx` — add `/admin` route, role-based rendering
- `src/components/PublicMap.jsx` — center + bounds on Mira Bhayander
- `src/components/ComplaintForm.jsx` — ward dropdown, location restriction
- `src/contexts/AuthContext.jsx` — add role field, admin login
- `src/services/authService.js` — email/password auth, role management
- `src/services/firestore.js` — role-based queries, admin CRUD
- `src/services/complaintService.js` — demo data → Mira Bhayander coords
- `src/utils/chatLogic.js` — localized system prompt, supply schedule

**Dependencies:** No new npm packages. Uses existing Firebase Auth email/password, Leaflet bounds, and Tailwind.
