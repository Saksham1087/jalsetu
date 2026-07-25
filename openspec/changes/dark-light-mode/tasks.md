## 1. Foundation — CSS tokens + useTheme hook

- [x] 1.1 Add semantic color tokens to `@theme` in `src/index.css` and `.dark` class overrides for all tokens
- [x] 1.2 Add `@custom-variant dark` for class-based Tailwind v4 dark mode and theme transition styles
- [x] 1.3 Create `src/hooks/useTheme.js` with localStorage persistence and system preference detection

## 2. Toggle + root wiring

- [x] 2.1 Wire theme to `<html>` in `App.jsx` and add scrollbar dark mode support in `index.css`
- [x] 2.2 Add sun/moon theme toggle button to `Header.jsx`

## 3. Citizen components — surfaces + text

- [x] 3.1 Update `BottomNav.jsx` with dark mode background/border/text tokens
- [x] 3.2 Update `ComplaintCard.jsx` with dark mode card/text/badge tokens
- [x] 3.3 Update `ComplaintDetail.jsx` modal with dark mode surface/text tokens
- [x] 3.4 Update `FilterBar.jsx` with dark mode background/dropdown/border tokens

## 4. Citizen components — forms, chat, list, map

- [x] 4.1 Update `ComplaintForm.jsx` with dark mode form elements and map modal
- [x] 4.2 Update `ChatWidget.jsx` with dark mode chat surface/text tokens
- [x] 4.3 Update `ComplaintList.jsx` with dark mode empty state/text tokens
- [x] 4.4 Update `PublicMap.jsx` legend panel, stats bar, and loading state with dark mode tokens
- [x] 4.5 Update `GoogleSignInButton.jsx` text colors for dark mode

## 5. Admin components

- [x] 5.1 Update `AdminLayout.jsx` sidebar, header, and main content with dark mode tokens
- [x] 5.2 Update `AdminDashboard.jsx`, `AdminComplaints.jsx`, and `AdminWards.jsx` with dark mode tokens

## 6. Map + final polish

- [x] 6.1 Update `src/styles/map.css` Leaflet popup and control colors for dark mode
- [x] 6.2 Verify build passes (`npm run build`)
