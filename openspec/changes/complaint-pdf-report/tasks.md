## 1. Install pdfmake dependency

- [x] 1.1 Install pdfmake via npm

## 2. Create PDF generator utility

- [x] 2.1 Create `src/utils/pdfGenerator.js` with a `generateComplaintPdf` function
- [x] 2.2 Function builds a pdfmake document definition with all complaint fields
- [x] 2.3 Image preloading: fetch remote images and convert to base64 if needed
- [x] 2.4 File naming: sanitize userName, format type, format date → `{userName}-{type}-{date}.pdf`

## 3. Add download to ComplaintForm success view

- [x] 3.1 Import and call pdfGenerator on the submitted complaint data
- [x] 3.2 Add "Download Report" button inside the success state markup
- [x] 3.3 Button styled consistently with the success view's teal theme

## 4. Add download to ComplaintDetail (user view)

- [x] 4.1 Add "Download Report" button to the bottom action bar
- [x] 4.2 Button placed before the "Close" button, styled as icon-only (shows "PDF" label on desktop)

## 5. Add download to AdminComplaintDetail (admin view)

- [x] 5.1 Add "Download Report" button to the detail panel
- [x] 5.2 Button placed between Status Update and Delete sections

## 6. Verification

- [x] 6.1 Build passes without errors
- [x] 6.2 Lint passes
- [x] 6.3 PDF downloads correctly from all three entry points
