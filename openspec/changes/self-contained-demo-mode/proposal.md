## Why

The app is broken without Firebase, Cloudinary, and Gemini API keys configured. The Map tab shows an error overlay, the Report tab requires auth + Cloudinary before submission, and the Chat widget is invisible. This makes the app unusable out of the box — a developer must set up 3+ external services just to see it work. The localStorage-based `complaintService` already has a full demo data layer, but most components bypass it and call Firestore directly.

## What Changes

- **Config detection**: Single `src/lib/config.js` that every component checks instead of scattered `import.meta.env` access
- **Synthetic demo user**: `useAuth` returns a `demoUser` when no Firebase is configured, unlocking all auth-gated features (Chat, Report, BottomNav)
- **useComplaints backend switch**: Check `hasFirebase` instead of `user` to choose localStorage vs Firestore; normalize field names so components don't need to know the source
- **PublicMap accepts complaints prop**: Dual data source — Firestore subscription when available, prop-based rendering otherwise; uses canonical `latitude`/`longitude`/`type` field names
- **ComplaintForm uses onSubmit**: Uses the `onSubmit` prop instead of calling `addComplaint` directly; photo upload falls back to base64 via canvas resize when Cloudinary isn't configured; validation gates are conditional on available services
- **Base64 photo upload**: Client-side image resize to 1200px max, JPEG quality 0.7, stored in `images` array in localStorage
- **Normalized data schema**: All data flows through `normalizeData()` that maps `lat`→`latitude`, `lng`→`longitude`, `severity`→`type`, `photoURL`→`images[]`
- **Layout fix**: Remove `min-h-[100dvh]` from inner components inside `flex-1` containers to eliminate scroll overflow
- **Remove MapView.jsx import**: Eliminates module-level CSS injection that conflicts with properly imported stylesheets
- **Header/ChatWidget/GoogleSignInButton adapt to demo mode**: Show "Demo Mode" badge, render chat widget, show "Demo Mode" chip instead of Google button

## Capabilities

### New Capabilities
- `demo-mode`: App works zero-config with localStorage, base64 photos, synthetic user, and pure-JS chat AI when no external services are configured
- `config-detection`: Centralized `src/lib/config.js` that reports which external services are available, consumed by all components

### Modified Capabilities
- (none — this is internal architecture cleanup with no external requirement changes)

## Impact

- **New file**: `src/lib/config.js`
- **Modified**: `src/hooks/useAuth.js`, `src/hooks/useComplaints.js`, `src/App.jsx`
- **Modified**: `src/components/PublicMap.jsx`, `src/components/ComplaintForm.jsx`, `src/components/Header.jsx`, `src/components/ChatWidget.jsx`, `src/components/GoogleSignInButton.jsx`
- **Removed import**: `MapView` from `App.jsx` (dead code, was only causing CSS injection)
- **Dependencies**: No new npm packages — `canvas` already in deps for server-side, browser `FileReader`/`Canvas API` used instead
- **No breaking changes**: All existing Firebase/Cloudinary paths continue to work when env vars are set
