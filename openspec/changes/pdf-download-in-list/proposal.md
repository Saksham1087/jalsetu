## Why

PDF download is currently only accessible from the map page's complaint detail bottom sheet. Users on the complaints list page have no way to download reports. Move the download button from the detail sheet (map path) to each complaint card in the list view.

## What Changes

- Remove PDF download button from `ComplaintDetail.jsx` (opened from map marker clicks)
- Add PDF download button to `ComplaintCard.jsx` (each card in the complaints list)

## Capabilities

### Modified Capabilities
- `complaint-detail-view`: Remove PDF download button
- `complaint-card`: Add PDF download button with download icon

## Impact

- `src/components/ComplaintDetail.jsx` — remove download button and its state/import
- `src/components/ComplaintCard.jsx` — add download button in the card footer area
