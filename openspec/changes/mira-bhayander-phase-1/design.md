## Context

JalSetu is a React + Vite PWA for water complaint reporting, currently generic with Delhi-centered defaults. It uses Firebase (Auth, Firestore), Leaflet maps, Tailwind CSS, and Groq-powered chatbot. The app has a demo mode (localStorage) and production mode (Firebase). MBMC (Mira Bhayander Municipal Corporation) has 24 electoral wards, 11 water supply divisions, and needs an admin workflow for complaint management.

Current state:
- Map centered on Delhi (28.61°N, 77.21°E), no bounds restriction
- No ward system in complaint form
- No admin dashboard or role-based access
- Chatbot has generic water Q&A, no local knowledge
- Demo data uses Delhi coordinates

## Goals / Non-Goals

**Goals:**
- Lock map and app to Mira Bhayander geographic bounds
- Add 24 MBMC wards to complaint form and list filters
- Build admin dashboard with complaint queue, stats, status management
- Implement role-based auth with separate admin login
- Enhance chatbot with Mira Bhayander supply schedule and local knowledge
- Update demo data to use Mira Bhayander coordinates

**Non-Goals:**
- Per-ward supply schedule modification (Phase 2 — store `wards` collection now, UI later)
- IoT sensor integration (future phase)
- Worker mobile app (future phase)
- Analytics dashboards beyond basic stats (future phase)
- Multi-language support (future phase)

## Decisions

### 1. Ward data as static config + Firestore override
**Decision:** Store default ward data in `src/lib/miraBhayander.js` as static config. Store per-ward schedule overrides in Firestore `wards` collection.
**Why:** Static config avoids unnecessary reads for data that rarely changes. Firestore override allows admin to modify schedules without redeployment.
**Alternatives considered:** All-Firestore (adds reads, latency) vs. all-static (can't modify without deploy).

### 2. Admin auth via Firebase Auth email/password
**Decision:** Use Firebase Auth email/password for admin login. Store role in Firestore `users` collection. Check role in client-side route guard.
**Why:** Firebase Auth handles password hashing, session management, and token refresh. Firestore role check is simple and auditable.
**Alternatives considered:** Custom token (more complex), admin-only Google domains (limited), middleware-based (needs server).

### 3. Map bounds via Leaflet maxBounds
**Decision:** Set Leaflet `maxBounds` to Mira Bhayander rectangle `[[19.25, 72.83], [19.32, 72.90]]` with `maxBoundsViscosity: 1.0`.
**Why:** Prevents users from accidentally panning outside the service area. Simple rectangle bounds (no polygon needed for Phase 1).
**Alternatives considered:** Polygon bounds (more accurate but complex), no bounds (user confusion).

### 4. Admin route as separate tab, not separate app
**Decision:** Add `/admin` route within the same React app, with `AdminLayout` wrapper and route guard based on auth role.
**Why:** Single codebase, shared components, easier deployment. Admin sees different layout but same auth system.
**Alternatives considered:** Separate app (more complex deployment), modal-based (bad UX for admin work).

### 5. Chatbot: extend existing chatLogic.js with localized prompts
**Decision:** Add Mira Bhayander system prompt layer to `src/utils/chatLogic.js`. Include supply schedule, ward info, MBMC contacts.
**Why:** Simplest path — no new dependencies. Groq API receives localized system prompt. Falls back to local intent matching when Groq unavailable.
**Alternatives considered:** Separate chatbot service (overkill), Firebase Cloud Functions (already exists but separate from client chat).

### 6. Ward system: 24 electoral wards (not property tax wards A-Z)
**Decision:** Use MBMC electoral wards 1-24 in complaint form. Citizens identify with these numbers.
**Why:** Electoral wards are what residents know. Property tax wards are administrative and confusing for citizens.

## Risks / Trade-offs

- **[Firebase costs]** Admin dashboard with real-time complaint queue increases Firestore reads → Mitigate with pagination, snapshot throttling
- **[Auth complexity]** Adding email/password auth alongside Google sign-in increases auth code surface → Mitigate by reusing Firebase Auth primitives, not custom auth
- **[Demo mode degradation]** Role-based features won't work in demo mode → Mitigate by making admin features Firebase-only (like existing real-time features)
- **[Ward data staleness]** Static ward list may become outdated if MBMC redraws boundaries → Mitigate by making ward data easily updateable in one file
- **[Map bounds too restrictive]** Rectangle bounds may exclude some edge areas → Mitigate by allowing slight buffer, reviewing with actual MBMC boundary data
