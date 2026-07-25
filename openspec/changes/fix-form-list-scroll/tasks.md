## 1. Main Layout Fix

- [ ] 1.1 Remove `overflow-hidden` from `<main>` in App.jsx
- [ ] 1.2 Remove `pb-24` from `<main>` in App.jsx

## 2. ComplaintForm Scroll Fix

- [ ] 2.1 Add `flex-1` to ComplaintForm outer div so `overflow-y-auto` activates
- [ ] 2.2 Verify form scrolls correctly on mobile viewport

## 3. ComplaintList Scroll Fix

- [ ] 3.1 Replace `min-h-screen min-h-[100dvh]` with `flex-1 overflow-y-auto` on ComplaintList outer div
- [ ] 3.2 Apply same fix to loading state wrapper in ComplaintList
- [ ] 3.3 Verify list scrolls correctly

## 4. Verification

- [ ] 4.1 Build passes without errors
- [ ] 4.2 Lint passes
- [ ] 4.3 Map tab unaffected
- [ ] 4.4 List tab scrolls
- [ ] 4.5 Report tab scrolls
