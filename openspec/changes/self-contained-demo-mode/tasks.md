## 1. Foundation — Config module and hook changes

- [x] 1.1 Create `src/lib/config.js` with `appConfig` (hasFirebase, hasCloudinary, hasGemini) and `isDemo` export
- [x] 1.2 Update `src/hooks/useComplaints.js`: add `hasFirebase` check, normalizeData function, branch `submitComplaint`/`updateComplaint` to localStorage when no Firebase
- [x] 1.3 Run `npm run lint` and fix any warnings

## 2. Fix broken components — Map and Report

- [x] 2.1 Update `src/components/PublicMap.jsx`: accept `complaints`+`loading` props, dual data source (Firestore or props), canonical field names (`latitude`/`longitude`/`type`), remove `min-h-[100dvh]`
- [x] 2.2 Update `src/components/ComplaintForm.jsx`: remove `addComplaint` import, use `onSubmit` prop, conditional validation based on `hasCloudinary`/`hasFirebase`, base64 photo upload with canvas resize, fix `fileInputRef` crash, remove `min-h-[100dvh]`
- [x] 2.3 Update `src/App.jsx`: pass `complaints`+`loading` to `PublicMap`, remove `MapView` import, fix `useComplaints()` args, remove duplicate `seedDemoData`
- [x] 2.4 Run `npm run lint` and verify Map + Report tabs work in demo mode

## 3. Enable demo user and auth-gated features

- [x] 3.1 Update `src/hooks/useAuth.js`: return synthetic `demoUser` when `!hasFirebase`, no-op `login`/`logout` in demo mode, import config
- [x] 3.2 Update `src/components/GoogleSignInButton.jsx`: handle `user.isDemoUser` — show "Demo Mode" chip instead of Google button or user name
- [x] 3.3 Update `src/components/Header.jsx`: show "Demo" badge next to title when `isDemo`
- [x] 3.4 Update `src/components/ChatWidget.jsx`: add demo mode banner, remove `!user` return-null guard (now covered by synthetic user)
- [x] 3.5 Run `npm run lint` and verify Chat + Header + all 3 tabs work with zero config
