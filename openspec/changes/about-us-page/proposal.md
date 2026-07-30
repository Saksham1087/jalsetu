## Why

No way for users to learn what JalSetu is about or who built it. Profile dropdown only has Profile and Sign Out — adding About Us gives transparency and developer credit.

## What Changes

- Add "About Us" option in the Header avatar dropdown between Profile and Sign Out
- Build AboutPage — full-page overlay (ProfilePage pattern) with app overview paragraph, developer info, and social links
- Wire `onAboutClick` from Header → App.jsx → renders AboutPage

## Impact

- **Header.jsx**: Add "About Us" button in dropdown
- **App.jsx**: `showAbout` state, `handleAboutClick`, conditional render of AboutPage
- **AboutPage.jsx**: New component
