# Responsive Fixes Tasks

## Critical (causes bugs)

- [x] Fix PublicMap.jsx popup "View Details" button tap target (padding 6px → 10px, min-height 44px)
- [x] Fix PublicMap.jsx SeverityLegend max-h-[70vh] → max-h-[70dvh]
- [x] Fix ChatWidget.jsx max-h-[70vh] → max-h-[70dvh]
- [x] Fix ComplaintForm.jsx mx-auto on absolute element (removed)
- [x] Fix ComplaintForm.jsx bottom action buttons add padding (px-4 py-2)
- [x] Fix ChatWidget.jsx FAB safe-area-inset-right + removed fragile inline maxHeight
- [x] Fix map.css zoom controls width/height from 36px to 44px

## Medium (usability)

- [x] Fix App.jsx pb-24 to dynamic safe area padding (added safe-area-inset-bottom)
- [x] Fix ComplaintForm.jsx pb-24 already had safe-area-inset-bottom
- [x] Fix BottomNav.jsx badge size (w-3.5→w-4, text-[8px]→text-[10px]) and font sizes (text-[11px]→text-xs)
- [x] Fix Header.jsx responsive horizontal padding (px-4 → px-4 lg:px-6)
- [x] Fix map.css popup min-width for small viewports (min(200px, calc(100vw - 48px)))
- [x] Fix ChatWidget.jsx fragile inline maxHeight (removed, using flex-1 only)
- [x] Fix AdminDashboard.jsx min-w-[200px] overflow (changed to min-w-0)
- [x] Fix AdminComplaints.jsx min-w overflow (changed to min-w-0)

## Low (polish)

- [x] Fix ComplaintForm.jsx photo preview max-w-[280px] (added w-full)
- [x] Fix GoogleSignInButton.jsx max-w-[120px] on large screens (added lg:max-w-[200px])
- [x] Fix AdminLayout.jsx sidebar responsive width (w-64 → w-64 lg:w-72)
- [x] Fix AdminWards.jsx single column → responsive grid (sm:grid-cols-2 lg:grid-cols-3)
- [x] Fix AdminWards.jsx URL truncation (added lg:max-w-none)
- [x] Fix PublicMap.jsx popup maxWidth responsive (min-width: 200px)
- [x] Fix Header.jsx Demo badge font size (text-[10px] → text-xs)
- [x] Build and lint verification
