## Context

JalSetu complaints use opaque IDs (Firestore `doc.id` or `crypto.randomUUID()`). There is no way to look up a complaint without browsing the full list. The existing `ComplaintDetail` component renders all the info we need — status, timeline, photos, description — but is only accessible via the list/map views and includes admin action buttons.

## Goals / Non-Goals

**Goals:**
- Anyone with a complaint ID can see its status and timeline, no login required
- Complaint IDs become human-readable and shareable (e.g., `CQ-2026-A1B2`)
- After submitting, the user sees their complaint ID prominently
- The existing `ComplaintDetail` component is reused for the track view

**Non-Goals:**
- No edit/action capabilities for unauthenticated viewers
- No notification system for status changes (separate change)
- No QR code or deep-link generation

## Decisions

1. **Human-readable ID generation**: Format `CQ-{YEAR}-{XXXX}` where XXXX is a 4-character alphanumeric code. Generated at complaint creation time. Stored as `displayId` field on the complaint document. Demo mode already uses `crypto.randomUUID()` — we'll add a parallel `displayId` there too.

2. **Reuse ComplaintDetail with `viewOnly` prop**: Rather than building a separate detail view, add a `viewOnly` boolean prop to `ComplaintDetail`. When true, the bottom action buttons (Acknowledge, Start Work, Mark Resolved, Close) are hidden — only the Close button remains.

3. **Single-complaint fetch**: Firestore side uses `getDoc(doc(db, 'complaints', id))` — a one-time fetch, not a real-time subscription. Demo side filters `localStorage` by `complaint.id` or by `displayId`. Both support lookup by either the internal `id` or the `displayId`.

4. **Public page, no auth gate**: The Track page renders without checking auth. If the complaint ID doesn't exist, show a "not found" state with the input still available for retry.

## Risks / Trade-offs

- **Brute-force ID guessing**: Short human-readable IDs are guessable. Mitigation: 4-char alphanumeric gives ~1.6M combinations per year. For a civic app limited to Mira Bhayander, this is acceptable risk. The data shown is non-sensitive (already visible on the public map).
- **Demo mode ID mismatch**: Demo complaints created before this change won't have a `displayId`. Mitigation: fall back to matching on `complaint.id` (the UUID) when lookup by `displayId` fails.
