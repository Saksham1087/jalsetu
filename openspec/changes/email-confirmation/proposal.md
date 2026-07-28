## Why

Users who submit a complaint get no confirmation outside the app. They need to trust the success screen. An automatic email gives them a written record that their complaint was received, with all details they submitted.

## What Changes

- Store `userEmail` on complaint documents at creation time
- Create a Firebase Cloud Function that triggers on complaint creation and sends a polite confirmation email via SMTP
- In demo mode, show a simulated "Email confirmation sent" message in the UI
- Add Nodemailer dependency to functions/

## Capabilities

### New Capabilities
- `email-confirmation`: Firebase Cloud Function that listens for new complaint documents and sends a confirmation email with complaint details

### Modified Capabilities
- `complaint-creation`: Add `userEmail` field to complaint data in both Firestore and localStorage paths
- `complaint-form-success`: Show email confirmation message in the success view

## Impact

- `src/services/firestore.js` — add `userEmail` to `createComplaintData`
- `src/services/complaintService.js` — add `userEmail` to complaint creation
- `src/components/ComplaintForm.jsx` — show email confirmation message in success state
- `functions/index.js` — new Cloud Function for sending email
- `functions/package.json` — add `nodemailer` dependency
