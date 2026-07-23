## 1. Mira Bhayander Localization Foundation

- [x] 1.1 Create `src/lib/miraBhayander.js` with ward data (24 wards), map bounds, default supply schedule, and MBMC contacts
- [x] 1.2 Verify `src/lib/miraBhayander.js` exports correctly

## 2. Map Localization

- [x] 2.1 Update `src/components/PublicMap.jsx` — change default center from Delhi to Mira Bhayander (19.2813, 72.8568)
- [x] 2.2 Add `maxBounds` to MapContainer restricting to `[[19.25, 72.83], [19.32, 72.90]]`
- [x] 2.3 Update demo data coordinates in `src/services/complaintService.js` to Mira Bhayander locations
- [ ] 2.4 Verify map loads centered on Mira Bhayander and panning stops at bounds

## 3. Ward System

- [x] 3.1 Add ward dropdown to `src/components/ComplaintForm.jsx` using ward data from `miraBhayander.js`
- [x] 3.2 Add ward field to complaint data model in `src/services/firestore.js`
- [x] 3.3 Add ward filter to `src/components/ComplaintList.jsx` and `FilterBar.jsx`
- [x] 3.4 Update `src/components/PublicMap.jsx` to show ward info in marker popups
- [x] 3.5 Update `src/services/complaintService.js` demo data to include ward field

## 3B. Optional Reporting Fields

- [x] 3B.1 Add optional mobile number field to `src/components/ComplaintForm.jsx` (phone input with validation)
- [x] 3B.2 Add mobile field to complaint data model in `src/services/firestore.js`
- [x] 3B.3 Verify description field exists and is optional (it already exists as required — make it optional or keep required based on UX)

## 3C. Browser Geolocation with Fallback

- [x] 3C.1 Update `src/components/ComplaintForm.jsx` to request browser geolocation on form open
- [x] 3C.2 If geolocation granted → auto-fill lat/lng and reverse geocode address/ward
- [x] 3C.3 If geolocation denied/unavailable → show "Enable Location" prompt with "Mark on Map" fallback button
- [x] 3C.4 "Mark on Map" opens full-screen Leaflet map for manual pin placement
- [x] 3C.5 Update `src/hooks/useLocation.js` to support permission state tracking

## 4. Role-Based Auth

- [x] 4.1 Add role field to Firestore user document in `src/services/authService.js`
- [x] 4.2 Update `src/contexts/AuthContext.jsx` to store and expose user role
- [x] 4.3 Add email/password registration and login to `src/services/authService.js`
- [x] 4.4 Create admin login page component `src/components/AdminLoginPage.jsx`
- [x] 4.5 Add `/login` route to `src/App.jsx`
- [x] 4.6 Add role check function to verify admin role from Firestore

## 5. Admin Dashboard

- [x] 5.1 Create `src/components/admin/AdminLayout.jsx` with sidebar nav and header
- [x] 5.2 Create `src/components/admin/AdminDashboard.jsx` with stats cards and complaint queue
- [x] 5.3 Create `src/components/admin/AdminComplaintDetail.jsx` with full complaint view and status update
- [x] 5.4 Add `/admin` route with role-based guard to `src/App.jsx`
- [x] 5.5 Add real-time complaint subscription for admin queue in `src/services/firestore.js`
- [x] 5.6 Add admin status update function to `src/services/firestore.js`
- [x] 5.7 Add status filter and ward filter to admin complaint queue

## 6. Chatbot Enhancement

- [x] 6.1 Update `src/utils/chatLogic.js` with Mira Bhayander system prompt (supply schedule, contacts, known issues)
- [x] 6.2 Add supply schedule knowledge: "7-9 AM and 7-9 PM daily" default response
- [x] 6.3 Add MBMC contact knowledge: water complaint number (022-28140002)
- [x] 6.4 Add area-specific guidance for known issue pockets
- [x] 6.5 Update `src/components/ChatWidget.jsx` welcome message to reference Mira Bhayander

## 7. Node.js Server Setup

- [x] 7.1 Create `server.js` with Express.js to serve static `dist/` files
- [x] 7.2 Add SPA fallback (all routes serve `index.html` for client-side routing)
- [x] 7.3 Add security headers (helmet) and compression (gzip)
- [x] 7.4 Add environment variable loading for PORT and Firebase config
- [x] 7.5 Create `ecosystem.config.js` for PM2 process manager (auto-restart, clustering)
- [x] 7.6 Add `npm run start` script to package.json (node server.js)
- [x] 7.7 Add `.env.production` example with server config

## 8. Lint and Verify

- [x] 8.1 Run `npm run lint` and fix any Oxlint errors
- [x] 8.2 Run `npm run build` and verify production build succeeds
- [ ] 8.3 Test demo mode (no Firebase) — map loads on Mira Bhayander, chatbot works, form shows wards
- [ ] 8.4 Test Firebase mode — admin login works, dashboard shows complaints, status updates work
- [ ] 8.5 Test Node.js server — `npm run start` serves app on configured PORT
