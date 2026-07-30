## Approach

All changes are in `Dashboard.jsx` only. No new files, no hook changes, no service changes.

### State

```js
const [viewMode, setViewMode] = useState('my') // 'my' | 'city'
```

### Data Flow

```
complaints (all, from prop)
  │
  ├── viewMode === 'my'   → myComplaints = complaints.filter(user match)
  ├── viewMode === 'city' → allComplaints = complaints (no filter)
```

### Segmented Control

Rendered as a row of two buttons inside a container with rounded-xl + border. Active tab: `bg-teal-600 text-white`. Inactive tab: `text-text-secondary`.

```
┌──────────────────────────────────────┐
│  ┌──────────────┬──────────────────┐ │
│  │   My View    │ JalSetu Overview │ │
│  └──────────────┴──────────────────┘ │
└──────────────────────────────────────┘
```

### Conditional Rendering

| Element | My View | JalSetu Overview |
|---------|---------|-----------------|
| Header | "Welcome, {name}" | "JalSetu Overview" |
| Stats source | `myComplaints` | `complaints` |
| Recent source | `myComplaints` | `complaints` |
| Empty state | shown if `myComplaints.length === 0` | never shown |

### No Persistence

`viewMode` resets to `'my'` on component mount (already default state).
