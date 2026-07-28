## Why

The PDF report includes a timeline section that adds clutter. Users submitting complaints want a clean report with just the essential details. Also, after submission the success screen auto-dismisses with no way to exit early — users must wait or refresh.

## What Changes

- Remove timeline section from the generated PDF report
- Add a "Back" / "Close" button to the success screen so users can dismiss it immediately
- Remove the auto-dismiss timeout (manual dismissal only)

## Capabilities

### Modified Capabilities
- `pdf-report-generation`: Remove timeline section and related styles from the document definition
- `complaint-form`: Add manual close button to success overlay; remove auto-dismiss timer

## Impact

- `src/utils/pdfGenerator.js` — Remove timeline content and styles
- `src/components/ComplaintForm.jsx` — Add close button to success view, remove auto-dismiss
