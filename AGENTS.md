# JalSetu - Water Complaint Reporting Platform

## Project Overview
Mobile-first React + Vite application for citizens to report water supply issues (leakage, contamination, low pressure, no water, billing) and track complaint status. Built with Tailwind CSS, PWA support, and Leaflet maps.

## Tech Stack
- **React 19** + **Vite 8** (ESM, fast HMR)
- **Tailwind CSS 4** (mobile-first, utility-first)
- **Leaflet** for interactive maps
- **LocalStorage** for data persistence (demo)
- **PWA** ready with manifest + service worker support

## Project Structure
```
src/
├── components/          # UI components
│   ├── Header.jsx       # Top bar with logo & auth
│   ├── BottomNav.jsx    # Fixed bottom tab bar (Map/List/Report)
│   ├── ComplaintForm.jsx # Multi-step complaint submission
│   ├── ComplaintList.jsx # Filterable/sortable complaint feed
│   ├── ComplaintCard.jsx # Individual complaint display
│   ├── MapView.jsx      # Leaflet map with markers
│   ├── ComplaintDetail.jsx # Modal with timeline & photos
│   ├── FilterBar.jsx    # Sticky filter/search/sort
│   └── AuthModal.jsx    # Login/Register modal
├── hooks/
│   ├── useComplaints.js # Complaint CRUD + state
│   ├── useLocation.js   # Geolocation (getCurrentPosition + watch)
│   └── useAuth.js       # Auth state + login/register/logout
├── services/
│   ├── complaintService.js # LocalStorage API
│   └── authService.js       # User management
├── utils/
│   ├── formatters.js    # Date, distance, status formatting
│   └── geo.js           # Distance calc, bounds, debounce
└── App.jsx              # Main layout + tab routing
```

## Key Features Implemented
- **3-tab navigation**: Map (Leaflet), List (infinite scroll), Report (multi-step form)
- **Complaint form**: Type selection, description, GPS location picker, photos (5 max), ward/landmark
- **Map view**: Clustered markers, user location pulse, popup details, zoom controls
- **Filter/sort**: By type, status, search text, distance/newest/oldest/status
- **Auth**: Email/password + phone, persisted in LocalStorage
- **Offline-first**: Service worker ready, data cached locally
- **Mobile UX**: Safe-area insets, 44px touch targets, pull-to-refresh, bottom sheets

## Design System (Tailwind)
- **Primary**: Sky/Blue (`#0ea5e9` - water theme)
- **Status colors**: Blue/Amber/Purple/Green/Red
- **Spacing**: 4px base, safe-area insets
- **Typography**: Inter font, responsive sizing
- **Shadows**: Layered elevation (sm/md/lg/xl)
- **Animations**: Fade, slide-up, pulse, spin

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Oxlint
npm run preview  # Preview build
```

## Future Enhancements
- Backend API integration (replace LocalStorage)
- Push notifications for status updates
- Photo compression before upload
- Admin dashboard for officials
- Multi-language support (Hindi, regional)
- Offline queue with background sync
