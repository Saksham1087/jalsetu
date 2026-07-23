# JalSetu - Water Complaint Reporting Platform

Mobile-first React PWA for citizens to report water supply issues and track complaint status. Deployed to GitHub Pages via GitHub Actions.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build (outputs to dist/)
npm run lint     # Oxlint (NOT ESLint — see .oxlintrc.json)
npm run preview  # Preview production build
```

No test suite exists. Lint is the only verification step.

## Tech Stack

- **React 19** + **Vite 8** (ESM, `@vitejs/plugin-react`)
- **Tailwind CSS 4** via PostCSS (`@tailwindcss/postcss`)
- **Oxlint** for linting (not ESLint — `.oxlintrc.json` configures react rules)
- **Firebase** — Auth (Google sign-in), Firestore, Cloud Functions, Hosting
- **Leaflet** + `react-leaflet` + `leaflet.markercluster` for maps
- **Cloudinary** for photo uploads (loaded via `index.html` script tag)
- **Groq** AI API for chat widget

## Project Structure

```
src/
├── components/       # 12 components (see below)
├── contexts/         # AuthContext.jsx — app-wide auth provider
├── hooks/            # useAuth, useComplaints, useLocation
├── services/
│   ├── firestore.js  # Firestore CRUD (complaints collection)
│   ├── complaintService.js
│   └── authService.js
├── lib/
│   ├── firebase.js   # Firebase init, exports auth/db/functions
│   └── config.js     # Feature flags (hasFirebase, hasCloudinary, hasGroq)
├── utils/            # formatters, geo, chatLogic, groqChat, geminiChat
├── styles/           # complaint-form.css, map.css (Leaflet overrides)
└── App.jsx           # Tab routing (map/list/report), auth integration
functions/            # Firebase Cloud Functions (CommonJS, Node 20)
```

## Key Components

- `PublicMap.jsx` — Main map view (not MapView, which exists but is not the active map)
- `ChatWidget.jsx` — Groq-powered AI chat assistant
- `ComplaintForm.jsx` — Multi-step submission with photo upload
- `AuthContext.jsx` — Wraps app; provides `useAuthContext()` hook

## Architecture Notes

- **Demo mode**: When `VITE_FIREBASE_API_KEY` is unset, `lib/config.js:isDemo = true`. Firebase gracefully degrades — app runs without backend.
- **Vite base path**: Set to `/jalsetu/` in `vite.config.js` for GitHub Pages hosting. Local dev works fine; production URLs are `/jalsetu/*`.
- **Cloud Functions** in `functions/index.js` — `chatWithAI` callable function does simple keyword matching (no external AI). Separate from the client-side Groq chat.
- **Firestore** stores complaints in `complaints` collection with `serverTimestamp()`, real-time subscriptions via `onSnapshot`.
- **Photo uploads** go to Cloudinary (client-side) or Firebase Storage (in `firestore.js:uploadComplaintPhoto`).
- **Tailwind config** (`tailwind.config.js`) defines custom colors: `primary` (sky), `water`, `warning`, `success`, `danger`, plus safe-area spacing.

## Environment Variables

Required for full functionality (see `.env.example`):
- `VITE_FIREBASE_*` — Firebase config
- `VITE_CLOUDINARY_*` — Photo uploads
- `VITE_GROQ_API_KEY` — AI chat

## Deployment

GitHub Actions (`deploy.yml`) builds on push to `main`, deploys to GitHub Pages. Firebase hosting (`firebase.json`) is configured separately for the `jalsetu-4e54b` project.
