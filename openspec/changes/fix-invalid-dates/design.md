## Root Cause

Three paths data flows through:

**Main user path** (`useComplaints.js` → `normalizeData`): Normalizes `createdAt`/`updatedAt` to ISO strings, but leaves `timeline[].timestamp` as-is (Firestore Timestamp or Date object).

**Admin path** (`App.jsx` admin subscription): No date normalization at all — `createdAt`, `updatedAt`, and timeline timestamps remain as Firestore Timestamp objects.

**Client-side only** (`complaintService`): Uses ISO strings from `toISOString()`, which work fine.

When a Firestore Timestamp object reaches `new Date(timestamp)`, JavaScript can't parse it → "Invalid Date".

## Fix Strategy

Instead of normalizing at every pipeline stage, fix at the consuming end with a single robust `toDate()` helper. This is more maintainable and handles edge cases in one place.

```js
toDate(value)
  ├── null/undefined → null
  ├── Firestore Timestamp (.toDate exists) → call .toDate()
  ├── Date instance → return as-is
  ├── ISO string → new Date(string)
  └── unparseable → null
```

`formatRelativeTime` and `formatDate` use `toDate()` internally — every component that already uses those gets fixed automatically. Inline `new Date()` calls get replaced with `toDate()`.

## Normalization Enhancement

Also normalize `timeline[].timestamp` in `useComplaints.js` `normalizeData` so all downstream consumers get consistent data.
