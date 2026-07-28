## Why

Users submitting water complaints have no way to save or share a formal record of their report. Currently the app shows a success animation and the complaint appears in the list — but there's no downloadable document users can keep, print, or share with authorities. Admins also lack the ability to generate official reports for any complaint.

## What Changes

- Add client-side PDF report generation using pdfmake (lazy-loaded)
- Add "Download Report" button in three places:
  - ComplaintForm success view (after submission, within auto-dismiss timeline)
  - ComplaintDetail (user's complaint detail drawer)
  - AdminComplaintDetail (admin's complaint detail panel)
- PDF includes all complaint data with professional formatting

## Capabilities

### New Capabilities
- `pdf-report-generation`: Client-side PDF generation utility that constructs a formatted pdfmake document definition from complaint data. Supports text, tables, images (from URLs and data URIs), timeline lists, status badges, and page headers/footers.
- `pdf-download-trigger`: Download button UI component integration at three touch points with appropriate styling.

### Modified Capabilities
- `complaint-form`: Extended success state to show download trigger alongside existing success message.
- `complaint-detail-view`: Extended user-side detail drawer with download button.
- `admin-complaint-detail`: Extended admin-side detail panel with download button.

## Impact

- `package.json` — new dependency: pdfmake
- `src/utils/pdfGenerator.js` — new file
- `src/components/ComplaintForm.jsx` — add download button in success view
- `src/components/ComplaintDetail.jsx` — add download button in bottom bar
- `src/components/admin/AdminComplaintDetail.jsx` — add download button in detail panel
- No API, Firestore, or routing changes
