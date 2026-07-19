## Context

The app has two parallel data stacks — `complaintService` (localStorage) and `firestore.js` (Firebase). The `useComplaints` hook already attempts to abstract between them, switching on `!user`. But three components bypass the hook entirely: `PublicMap` calls Firestore directly for data, `ComplaintForm` calls `addComplaint` directly for writes, and `ChatWidget` hides behind a `!user` gate. The result: without Firebase + Cloudinary + Gemini configured, the Map shows an error, the Report form can't submit, and Chat is invisible.

The localStorage stack (`complaintService`, `authService`) is complete and functional — it just needs to be used consistently.

## Goals / Non-Goals

**Goals:**
- All 3 tabs (Map, List, Report) work without any env vars configured
- Chat widget renders and responds with pure-JS AI
- Demo data persists across reloads
- Submitted complaints appear on the map and list immediately
- No regressions when Firebase/Cloudinary ARE configured

**Non-Goals:**
- Multi-user support in demo mode (single synthetic user)
- Push notifications or real-time sync in demo mode
- Photo compression beyond basic canvas resize
- Backend API integration (future concern)

## Decisions

**Decision 1: Config module over scattered env var checks**
- A single `src/lib/config.js` exports `appConfig` (hasFirebase, hasCloudinary, hasGemini) and `isDemo`
- Every component imports from here instead of checking `import.meta.env` inline
- Alternative considered: React context — unnecessary overhead for synchronous config that never changes at runtime

**Decision 2: Synthetic user object over `isDemo` flag everywhere**
- `useAuth` returns `{ uid: 'demo-user', displayName: 'Demo User', isDemoUser: true }` when no Firebase
- Every `if (!user)` gate in the codebase passes automatically — `ChatWidget`, `BottomNav`, `ComplaintForm`, `GoogleSignInButton` all work without individual changes
- Alternative considered: passing `isDemo` prop to each auth-gated component — more mechanical work, higher risk of missing a gate

**Decision 3: `useComplaints` checks `hasFirebase` instead of `user`**
- The hook currently branches on `!user` to choose backend. With synthetic user, user is always truthy. Switching to `hasFirebase` correctly distinguishes demo vs production
- `submitComplaint` calls `complaintService.create` in demo mode, `addComplaint` in production
- `updateComplaint` falls back to `complaintService.update` in demo mode

**Decision 4: `normalizeData` at the hook boundary**
- `useComplaints` runs all data through a `normalizeData` function that maps field names to a canonical schema: `lat`→`latitude`, `lng`→`longitude`, `severity`→`type`, `photoURL`→`images[]`
- Components only see `latitude`, `longitude`, `type`, `images` — they don't need to know the data source
- Alternative considered: normalizing at each component — would require identical logic in 3+ places

**Decision 5: Photo upload uses base64 via canvas in demo mode**
- `FileReader.readAsDataURL + canvas resize (1200px max) + toDataURL('image/jpeg', 0.7)`
- Stored as first element of `images` array — same field that Cloudinary URLs populate in production
- Size: ~100-300KB per photo, well within localStorage's ~5MB limit
- Alternative considered: URL.createObjectURL — only valid for current session, not persistent

**Decision 6: `PublicMap` dual data source**
- Accepts `complaints` and `loading` props from parent
- When `hasFirebase`: subscribes to Firestore as before (realtime updates)
- When `!hasFirebase`: uses the `complaints` prop directly
- Both paths produce normalized data with `latitude`/`longitude`/`type`

## Risks / Trade-offs

- [Risk] `localStorage` 5MB limit for photos — Mitigation: canvas resize keeps each photo under 300KB; ~15 photos before hitting limit; complaint form shows error if upload fails
- [Risk] base64 stored in localStorage is slow to read/write for large photo sets — Mitigation: photos are limited to 1 per complaint, ~300KB each; even 100 complaints is only ~30MB (still over limit but acceptable for demo)
- [Risk] Demo user is shared — Mitigation: demo mode is single-user by design; switching to real Firebase Auth replaces the synthetic user transparently
- [Trade-off] No real-time updates in demo mode — the list and map update on submit/refresh, not via Firestore `onSnapshot`
- [Trade-off] `MapView.jsx` import removal may surprise someone looking for it — it's dead code; the active map is `PublicMap`
